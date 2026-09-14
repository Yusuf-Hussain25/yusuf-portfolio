"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Close, Send, Upload } from "@/components/ui/icons";
import {
  analyzePixels,
  createSampleImage,
  detectNative,
  requestModelVision,
  toDataURL,
  type ModelVision,
  type NativeDetections,
  type VisionSignals,
} from "@/lib/ai/vision";
import { useReducedMotion, useTheme } from "@/lib/hooks";
import "./vision-lab.css";

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;
const CARD = "rounded-2xl border border-line bg-surface shadow-[var(--shadow-panel)]";

type Meta = { name: string; type: string; size: number };
type Loaded = Meta & { img: HTMLImageElement; src: string };
type ModelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ModelVision };
type LayerKey = "edges" | "focus" | "boxes";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = src;
  });
}

const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;
const pct = (v: number) => `${Math.round(v * 100)}%`;

function Badge({ kind }: { kind: "local" | "browser" | "model" }) {
  const map = {
    local: ["Measured locally", "bg-success"],
    browser: ["Browser API", "bg-accent"],
    model: ["Model output", "bg-warning"],
  } as const;
  const [label, dot] = map[kind];
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line px-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

function PanelHeader({ title, badge, right }: { title: string; badge?: "local" | "browser" | "model"; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <span className="eyebrow">{title}</span>
      <div className="flex min-w-0 items-center gap-2">
        {right}
        {badge && <Badge kind={badge} />}
      </div>
    </div>
  );
}

function SignalBar({ label, hint, value, display, scale = 1, ready }: { label: string; hint: string; value: number; display: string; scale?: number; ready: boolean }) {
  const width = ready ? Math.min(1, value / scale) : 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5">
      <div className="truncate text-[13px] text-foreground">
        {label}
        <span className="ml-2 font-mono text-[10.5px] text-subtle">{hint}</span>
      </div>
      <div className="font-mono text-[12px] tabular-nums text-muted">{ready ? display : "—"}</div>
      <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out dark:shadow-[0_0_12px_-1px_var(--accent)]"
          style={{ width: `${width * 100}%` }}
        />
      </div>
    </div>
  );
}

const LAYER_LABELS: Record<LayerKey, string> = { edges: "Edge map", focus: "Focus + thirds", boxes: "Detections" };

export default function VisionLab() {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const edgeRef = useRef<HTMLCanvasElement>(null);
  const runId = useRef(0);
  const dataUrlRef = useRef<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [signals, setSignals] = useState<VisionSignals | null>(null);
  const [native, setNative] = useState<NativeDetections | null>(null);
  const [model, setModel] = useState<ModelState>({ status: "idle" });
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ edges: false, focus: true, boxes: true });
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const run = useCallback(
    async (src: string, meta: Meta) => {
      const id = ++runId.current;
      setError(null);
      setStatus("analyzing");
      setSignals(null);
      setNative(null);
      setModel({ status: "loading" });
      setAnswer(null);

      let img: HTMLImageElement;
      try {
        img = await loadImage(src);
      } catch {
        if (id === runId.current) {
          setError("That file couldn't be decoded as an image.");
          setStatus("idle");
          setModel({ status: "idle" });
        }
        return;
      }
      if (id !== runId.current) return;
      if (objectUrlRef.current && objectUrlRef.current !== src) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = src.startsWith("blob:") ? src : null;
      setLoaded({ ...meta, img, src });

      const started = performance.now();
      const measured = analyzePixels(img);
      const detections = await detectNative(img);
      const hold = reduced ? 0 : Math.max(0, 1100 - (performance.now() - started));
      await new Promise((r) => setTimeout(r, hold));
      if (id !== runId.current) return;
      setSignals(measured);
      setNative(detections);
      setStatus("done");

      const dataUrl = toDataURL(img);
      dataUrlRef.current = dataUrl;
      const res = await requestModelVision(dataUrl);
      if (id !== runId.current) return;
      if (res.mode === "llm") setModel({ status: "ready", data: res });
      else if (res.mode === "unconfigured") setModel({ status: "unconfigured" });
      else setModel({ status: "error", message: res.message });
    },
    [reduced],
  );

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!ACCEPT.includes(file.type)) {
        setError(`“${file.name}” isn't supported — use PNG, JPEG, WebP, or GIF.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`That image is ${formatBytes(file.size)} — the limit is 8 MB.`);
        return;
      }
      void run(URL.createObjectURL(file), { name: file.name, type: file.type, size: file.size });
    },
    [run],
  );

  const loadSample = () => {
    const src = createSampleImage();
    void run(src, { name: "sample-scene.png", type: "image/png", size: Math.round((src.length * 3) / 4) });
  };

  const clear = () => {
    runId.current++;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    dataUrlRef.current = null;
    setLoaded(null);
    setSignals(null);
    setNative(null);
    setModel({ status: "idle" });
    setStatus("idle");
    setError(null);
    setAnswer(null);
    setQuestion("");
  };

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    const image = dataUrlRef.current;
    if (!question.trim() || !image || model.status !== "ready") return;
    setAsking(true);
    const res = await requestModelVision(image, question.trim());
    setAsking(false);
    setAnswer(res.mode === "llm" ? res.answer || "The model returned no answer." : res.mode === "error" ? res.message : "Model backend not connected.");
  };

  // paste an image from the clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, [contenteditable]")) return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        handleFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  useEffect(() => {
    const urls = objectUrlRef;
    return () => {
      if (urls.current) URL.revokeObjectURL(urls.current);
    };
  }, []);

  // render the Sobel magnitudes tinted with the theme accent
  useEffect(() => {
    const canvas = edgeRef.current;
    if (!canvas || !signals || !layers.edges) return;
    const { w, h, data } = signals.edges;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = getComputedStyle(document.documentElement).getPropertyValue("--net-accent").trim().split(/\s+/).map(Number);
    const out = ctx.createImageData(w, h);
    for (let i = 0; i < data.length; i++) {
      const o = i * 4;
      out.data[o] = r;
      out.data[o + 1] = g;
      out.data[o + 2] = b;
      out.data[o + 3] = Math.min(255, data[i] * 2.4);
    }
    ctx.putImageData(out, 0, 0);
  }, [signals, layers.edges, theme]);

  const ready = status === "done" && !!signals;
  const w = loaded?.img.naturalWidth ?? 1;
  const h = loaded?.img.naturalHeight ?? 1;
  const histMax = signals ? Math.max(...signals.histogram, 0.0001) : 1;
  const boxes = native?.boxes ?? [];

  const detectorRows = [
    { key: "faces", label: "Faces", count: boxes.filter((b) => b.label === "face").length },
    { key: "text", label: "Text regions (OCR)", count: boxes.filter((b) => b.label === "text").length },
    { key: "barcodes", label: "Barcodes & QR", count: boxes.filter((b) => b.label !== "face" && b.label !== "text").length },
  ];

  return (
    <div className="grid gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* ── Viewer ── */}
        <section aria-label="Image viewer" className={`${CARD} flex min-w-0 flex-col overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className={`h-2 w-2 shrink-0 rounded-full ${status === "analyzing" ? "breathe bg-accent" : ready ? "bg-success dark:shadow-[0_0_8px_var(--success)]" : "bg-line-strong"}`}
              />
              <span className="eyebrow">Viewer</span>
              <span className="truncate font-mono text-[11.5px] text-muted" aria-live="polite">
                {loaded ? `${loaded.name} · ${w}×${h} · ${formatBytes(loaded.size)}` : "No image loaded"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" data-vision-sample className="btn btn-ghost h-[34px] px-3 text-[13px]" onClick={loadSample}>
                Sample
              </button>
              <button type="button" className="btn btn-ghost h-[34px] px-3 text-[13px]" onClick={() => inputRef.current?.click()}>
                <Upload width={14} height={14} /> Upload
              </button>
              {loaded && (
                <button type="button" className="btn btn-ghost h-[34px] w-[34px] px-0" aria-label="Clear image" onClick={clear}>
                  <Close width={14} height={14} />
                </button>
              )}
            </div>
          </div>

          <div
            className={`vision-stage-grid relative flex h-[var(--stage-h)] items-center justify-center bg-sunken/60 p-4 [--stage-h:300px] sm:[--stage-h:380px] lg:[--stage-h:440px] ${dragging ? "outline-2 -outline-offset-8 outline-dashed outline-accent" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!dragging) setDragging(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            {(["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"] as const).map((pos) => (
              <span key={pos} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-line-strong ${pos}`} />
            ))}

            {!loaded ? (
              <div className="flex max-w-sm flex-col items-center gap-5 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface text-accent shadow-[var(--shadow-panel)] dark:shadow-[var(--glow)]">
                  <Upload width={22} height={22} />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground">Drop an image to analyze</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">or paste from your clipboard · PNG, JPEG, WebP, GIF · up to 8 MB</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" className="btn btn-primary h-10" onClick={() => inputRef.current?.click()}>
                    Browse files
                  </button>
                  <button type="button" data-vision-sample className="btn btn-ghost h-10" onClick={loadSample}>
                    Use sample image
                  </button>
                </div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle">Pixels never leave your browser unless a model is connected</p>
              </div>
            ) : (
              <div
                className="relative"
                style={{ aspectRatio: `${w} / ${h}`, width: `min(100%, calc((var(--stage-h) - 2rem) * ${w / h}))` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob/data URL preview */}
                <img
                  src={loaded.src}
                  alt={`Preview of ${loaded.name}`}
                  className="absolute inset-0 h-full w-full rounded-md object-cover transition-opacity duration-500"
                  style={{ opacity: layers.edges && ready ? 0.16 : 1 }}
                />
                {layers.edges && ready && (
                  <canvas ref={edgeRef} aria-hidden className="absolute inset-0 h-full w-full rounded-md dark:[filter:drop-shadow(0_0_3px_var(--accent))]" />
                )}
                {layers.focus && ready && signals && (
                  <>
                    <div aria-hidden className="vision-thirds pointer-events-none absolute inset-0 rounded-md opacity-60" />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${signals.focus.x * 100}%`, top: `${signals.focus.y * 100}%` }}
                    >
                      <span className="block h-10 w-10 rounded-full border border-accent bg-accent-muted dark:shadow-[var(--glow)]" />
                      <span className="absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 bg-accent/70" />
                      <span className="absolute left-1/2 top-1/2 h-16 w-px -translate-y-1/2 bg-accent/70" />
                      <span className="absolute left-7 top-7 whitespace-nowrap rounded bg-surface/90 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                        focus {signals.focus.x.toFixed(2)}, {signals.focus.y.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                {layers.boxes && ready &&
                  boxes.map((b, i) => (
                    <div
                      key={i}
                      aria-hidden
                      className="pointer-events-none absolute rounded-sm border border-accent dark:shadow-[var(--glow)]"
                      style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}
                    >
                      <span className="absolute -top-5 left-0 rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-contrast">{b.label}</span>
                    </div>
                  ))}
                {status === "analyzing" && (
                  <div aria-hidden className="absolute inset-0 overflow-hidden rounded-md bg-background/20">
                    <div className="vision-scan" />
                  </div>
                )}
              </div>
            )}

            {status === "analyzing" && (
              <span role="status" className="glass absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] text-foreground">
                <span className="breathe h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                Analyzing pixels…
              </span>
            )}
            {error && (
              <div role="alert" className="absolute inset-x-4 top-4 flex items-start justify-between gap-3 rounded-xl border border-danger/30 bg-surface px-3.5 py-2.5 text-[13px] text-danger shadow-[var(--shadow-panel)]">
                <span>{error}</span>
                <button type="button" aria-label="Dismiss error" className="shrink-0 text-muted hover:text-foreground" onClick={() => setError(null)}>
                  <Close width={14} height={14} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
            <span className="eyebrow mr-1">Layers</span>
            {(Object.keys(LAYER_LABELS) as LayerKey[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={layers[k]}
                disabled={!ready}
                onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}
                className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 font-mono text-[11.5px] transition-colors disabled:opacity-40 ${layers[k] ? "border-accent/40 bg-accent-muted text-foreground" : "border-line text-muted hover:text-foreground"}`}
              >
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${layers[k] ? "bg-accent" : "bg-line-strong"}`} />
                {LAYER_LABELS[k]}
                {k === "boxes" && ready ? ` (${boxes.length})` : ""}
              </button>
            ))}
            <span className="ml-auto font-mono text-[11px] text-subtle">{signals ? `${signals.ms < 1 ? "<1" : signals.ms} ms · analyzed at ≤320px` : ""}</span>
          </div>

          <div className="border-t border-line px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="eyebrow">Scene hints</span>
              <span className="font-mono text-[10.5px] text-subtle">heuristics over measured signals · not a trained classifier</span>
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {ready && signals ? (
                signals.hints.map((hint) => (
                  <li key={hint} className="rounded-full border border-line bg-sunken/60 px-3 py-1 text-[12.5px] text-muted">
                    {hint}
                  </li>
                ))
              ) : (
                <li className="text-[12.5px] text-subtle">{status === "analyzing" ? "Deriving hints…" : "Hints appear after analysis."}</li>
              )}
            </ul>
          </div>
        </section>

        {/* ── Measured signals ── */}
        <div className="grid min-w-0 content-start gap-4">
          <section aria-label="Measured signals" className={CARD}>
            <PanelHeader title="Signals" badge="local" />
            <div className="grid gap-4 p-4">
              <SignalBar ready={ready} label="Brightness" hint="mean luminance" value={signals?.brightness ?? 0} display={pct(signals?.brightness ?? 0)} />
              <SignalBar ready={ready} label="Contrast" hint="luminance σ" value={signals?.contrast ?? 0} display={pct(signals?.contrast ?? 0)} />
              <SignalBar ready={ready} label="Colorfulness" hint="Hasler–Süsstrunk" value={signals?.colorfulness ?? 0} display={pct(signals?.colorfulness ?? 0)} />
              <SignalBar ready={ready} label="Sharpness" hint="Laplacian variance" value={signals?.sharpness ?? 0} display={pct(signals?.sharpness ?? 0)} />
              <SignalBar ready={ready} label="Edge density" hint="Sobel > 40" value={signals?.edgeDensity ?? 0} scale={0.3} display={`${((signals?.edgeDensity ?? 0) * 100).toFixed(1)}%`} />
            </div>
          </section>

          <section aria-label="Color and exposure" className={CARD}>
            <PanelHeader title="Color & exposure" badge="local" right={<span className="hidden font-mono text-[10.5px] text-subtle sm:inline">k-means · k=5</span>} />
            <div className="grid gap-5 p-4">
              <div>
                <div className="flex h-9 overflow-hidden rounded-lg border border-line bg-sunken">
                  {ready && signals ? (
                    signals.palette.map((c) => (
                      <div key={c.hex} title={`${c.hex} · ${pct(c.share)}`} className="h-full transition-[flex-grow] duration-700" style={{ background: c.hex, flexGrow: c.share }} />
                    ))
                  ) : (
                    <div className={`h-full w-full ${status === "analyzing" ? "shimmer" : ""}`} />
                  )}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {(ready && signals ? signals.palette : []).map((c) => (
                    <li key={c.hex} className="flex items-center gap-2 font-mono text-[11.5px]">
                      <span aria-hidden className="h-3 w-3 rounded-[4px] border border-line" style={{ background: c.hex }} />
                      <span className="text-foreground">{c.hex.toUpperCase()}</span>
                      <span className="text-subtle">{pct(c.share)}</span>
                    </li>
                  ))}
                  {!ready && <li className="font-mono text-[11.5px] text-subtle">Dominant colors appear here.</li>}
                </ul>
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] text-foreground">Luminance histogram</span>
                  <span className="font-mono text-[10.5px] text-subtle">32 bins</span>
                </div>
                <div className="flex h-20 items-end gap-[2px] rounded-lg border border-line bg-sunken/50 px-1.5 pt-1.5" role="img" aria-label="Luminance histogram">
                  {Array.from({ length: 32 }, (_, i) => {
                    const v = signals?.histogram[i] ?? 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-[2px] bg-accent/70 transition-[height] duration-700 ease-out dark:bg-accent/80"
                        style={{ height: `${ready ? Math.max(2, (v / histMax) * 100) : 2}%`, transitionDelay: reduced ? "0ms" : `${i * 12}ms` }}
                      />
                    );
                  })}
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                  <span>Shadows</span>
                  <span>Midtones</span>
                  <span>Highlights</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ── Native detectors ── */}
        <section aria-label="Native detectors" className={`${CARD} min-w-0`}>
          <PanelHeader title="Native detectors" badge="browser" />
          <ul className="divide-y divide-line px-4">
            {detectorRows.map((row) => {
              const supported = native?.supported.includes(row.key);
              return (
                <li key={row.key} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-[13.5px] text-foreground">{row.label}</span>
                  {!native ? (
                    <span className="font-mono text-[11.5px] text-subtle">—</span>
                  ) : supported ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-success">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
                      {row.count} found
                    </span>
                  ) : (
                    <span className="font-mono text-[11.5px] text-subtle">Unavailable in this browser</span>
                  )}
                </li>
              );
            })}
          </ul>
          {native && native.text.length > 0 && (
            <div className="mx-4 mb-3 rounded-xl border border-line bg-sunken/60 p-3">
              <div className="eyebrow mb-2">Detected text</div>
              <p className="whitespace-pre-wrap font-mono text-[12px] text-foreground">{native.text.join("\n")}</p>
            </div>
          )}
          <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-subtle">
            Uses the Shape Detection API (FaceDetector, TextDetector, BarcodeDetector) where the browser exposes it. Regions are drawn on the viewer.
          </p>
        </section>

        {/* ── Model analysis ── */}
        <section aria-label="Model analysis" className={`${CARD} flex min-w-0 flex-col`}>
          <PanelHeader
            title="Model analysis"
            badge="model"
            right={model.status === "ready" ? <span className="truncate font-mono text-[10.5px] text-subtle">{model.data.model}</span> : undefined}
          />
          <div className="grid flex-1 content-start gap-4 p-4" aria-live="polite">
            {model.status === "idle" && (
              <p className="text-[13.5px] leading-relaxed text-muted">
                Load an image to request a semantic description, recognized objects, OCR, and visual Q&amp;A from a vision model.
              </p>
            )}
            {model.status === "loading" && (
              <div className="grid gap-2.5" aria-label="Waiting for model">
                {[92, 76, 84].map((wd) => (
                  <div key={wd} className="shimmer h-3 rounded-full bg-sunken" style={{ width: `${wd}%` }} />
                ))}
              </div>
            )}
            {model.status === "unconfigured" && (
              <>
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">Model backend not connected</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">
                      Everything above was measured locally from pixels. Description, object recognition, OCR, and Q&amp;A require a vision model behind this contract:
                    </p>
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-xl border border-line bg-sunken/70 p-3.5 font-mono text-[12px] leading-relaxed text-muted">
                  <span className="text-accent">POST</span> /api/vision{"\n"}
                  {"{ image: dataURL, question? }"}
                  {"\n"}
                  <span className="text-subtle">→</span> {"{ description, objects[], text, answer }"}
                </pre>
                <p className="font-mono text-[11.5px] text-subtle">
                  Set <span className="text-foreground">ANTHROPIC_API_KEY</span> on the server to enable.
                </p>
              </>
            )}
            {model.status === "error" && (
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] text-danger">{model.message}</p>
                {loaded && (
                  <button type="button" className="btn btn-ghost h-[34px] px-3 text-[13px]" onClick={() => void run(loaded.src, loaded)}>
                    Retry
                  </button>
                )}
              </div>
            )}
            {model.status === "ready" && (
              <>
                <p className="text-[14px] leading-relaxed text-foreground">{model.data.description}</p>
                {model.data.objects.length > 0 && (
                  <ul className="grid gap-2.5">
                    {model.data.objects.map((o, i) => (
                      <li key={`${o.label}-${i}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                        <span className="truncate text-[13px] text-foreground">{o.label}</span>
                        <span className="font-mono text-[11.5px] tabular-nums text-muted">{pct(Number(o.confidence) || 0)}</span>
                        <div className="col-span-2 h-1 overflow-hidden rounded-full bg-sunken">
                          <div className="h-full rounded-full bg-warning transition-[width] duration-700" style={{ width: pct(Math.min(1, Number(o.confidence) || 0)) }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {model.data.text && (
                  <div className="rounded-xl border border-line bg-sunken/60 p-3">
                    <div className="eyebrow mb-2">OCR text</div>
                    <p className="whitespace-pre-wrap font-mono text-[12px] text-foreground">{model.data.text}</p>
                  </div>
                )}
              </>
            )}

            {loaded && (
              <form onSubmit={ask} className="mt-auto grid gap-2.5 border-t border-line pt-4">
                <label htmlFor="vision-question" className="eyebrow">
                  Ask about this image
                </label>
                <div className="flex items-center gap-2 rounded-full border border-line bg-sunken/50 p-1 pl-4 focus-within:border-accent/60">
                  <input
                    id="vision-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={model.status !== "ready" || asking}
                    placeholder={model.status === "ready" ? "What text is visible?" : "Requires a connected vision model"}
                    maxLength={300}
                    className="h-9 min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-subtle disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={model.status !== "ready" || asking || !question.trim()}
                    aria-label="Ask"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
                  >
                    <Send width={15} height={15} />
                  </button>
                </div>
                {(asking || answer) && (
                  <p className={`text-[13.5px] leading-relaxed ${asking ? "text-subtle" : "text-foreground"}`}>{asking ? "Thinking…" : answer}</p>
                )}
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

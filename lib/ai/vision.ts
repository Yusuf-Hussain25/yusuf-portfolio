// Client-side computer-vision signals computed directly from pixels:
// k-means palette, exposure, contrast, colorfulness (Hasler–Süsstrunk),
// Sobel edges, Laplacian sharpness, and an edge-weighted focus point.
// Optional native detectors (Shape Detection API) are used when available.

export type Box = { x: number; y: number; w: number; h: number; label: string };

export type VisionSignals = {
  width: number;
  height: number;
  palette: { hex: string; share: number }[];
  brightness: number;
  contrast: number;
  colorfulness: number;
  sharpness: number;
  edgeDensity: number;
  focus: { x: number; y: number };
  histogram: number[];
  hints: string[];
  edges: { w: number; h: number; data: Uint8ClampedArray };
  ms: number;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const toHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

function drawScaled(src: CanvasImageSource, sw: number, sh: number, max: number) {
  const scale = Math.min(1, max / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, w, h);
  return { canvas, ctx, w, h };
}

export function toDataURL(img: HTMLImageElement, max = 1024): string {
  const { canvas } = drawScaled(img, img.naturalWidth, img.naturalHeight, max);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function kmeans(pixels: number[][], k: number) {
  const sorted = [...pixels].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centers = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]]);
  const assign = new Array(pixels.length).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    pixels.forEach((p, i) => {
      let best = 0;
      let bestD = Infinity;
      centers.forEach((c, j) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      });
      assign[i] = best;
      sums[best][0] += p[0];
      sums[best][1] += p[1];
      sums[best][2] += p[2];
      sums[best][3] += 1;
    });
    centers = sums.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : centers[j]));
  }
  const counts = centers.map((_, j) => assign.filter((a) => a === j).length);
  return centers
    .map((c, j) => ({ hex: toHex(c[0], c[1], c[2]), share: counts[j] / pixels.length }))
    .filter((c) => c.share > 0.01)
    .sort((a, b) => b.share - a.share);
}

export function analyzePixels(img: HTMLImageElement): VisionSignals {
  const start = performance.now();
  const { ctx, w, h } = drawScaled(img, img.naturalWidth, img.naturalHeight, 320);
  const { data } = ctx.getImageData(0, 0, w, h);
  const n = w * h;
  const lum = new Float32Array(n);
  const histogram = new Array(32).fill(0);
  const samples: number[][] = [];
  let sumL = 0;
  let sumL2 = 0;
  let sumRg = 0, sumYb = 0, sumRg2 = 0, sumYb2 = 0;

  for (let i = 0; i < n; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[i] = l;
    sumL += l;
    sumL2 += l * l;
    histogram[Math.min(31, Math.floor(l / 8))]++;
    const rg = r - g;
    const yb = 0.5 * (r + g) - b;
    sumRg += rg; sumYb += yb; sumRg2 += rg * rg; sumYb2 += yb * yb;
    if (i % 3 === 0) samples.push([r, g, b]);
  }

  const meanL = sumL / n;
  const stdL = Math.sqrt(Math.max(0, sumL2 / n - meanL * meanL));
  const mRg = sumRg / n, mYb = sumYb / n;
  const sRg = Math.sqrt(Math.max(0, sumRg2 / n - mRg * mRg));
  const sYb = Math.sqrt(Math.max(0, sumYb2 / n - mYb * mYb));
  const colorfulnessRaw = Math.sqrt(sRg ** 2 + sYb ** 2) + 0.3 * Math.sqrt(mRg ** 2 + mYb ** 2);

  // Sobel + Laplacian
  const edges = new Uint8ClampedArray(n);
  let strong = 0, lapSum = 0, lapSum2 = 0, fx = 0, fy = 0, fw = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const tl = lum[i - w - 1], t = lum[i - w], tr = lum[i - w + 1];
      const l = lum[i - 1], c = lum[i], r = lum[i + 1];
      const bl = lum[i + w - 1], b = lum[i + w], br = lum[i + w + 1];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const mag = Math.min(255, Math.hypot(gx, gy) / 4);
      edges[i] = mag;
      if (mag > 40) strong++;
      fx += x * mag; fy += y * mag; fw += mag;
      const lap = t + l + r + b - 4 * c;
      lapSum += lap;
      lapSum2 += lap * lap;
    }
  }
  const inner = Math.max(1, (w - 2) * (h - 2));
  const lapVar = lapSum2 / inner - (lapSum / inner) ** 2;

  const signals = {
    brightness: meanL / 255,
    contrast: clamp(stdL / 90),
    colorfulness: clamp(colorfulnessRaw / 110),
    sharpness: clamp(Math.log10(lapVar + 1) / 3.4),
    edgeDensity: strong / inner,
  };

  const hints: string[] = [];
  if (signals.colorfulness < 0.14 && signals.contrast > 0.35 && signals.edgeDensity > 0.06) hints.push("Document or screenshot-like — low color, crisp high-contrast edges");
  else if (signals.colorfulness < 0.06) hints.push("Near-monochrome image");
  if (signals.colorfulness > 0.5) hints.push("Highly saturated palette");
  if (signals.brightness < 0.25) hints.push("Low-key, dark exposure");
  if (signals.brightness > 0.78) hints.push("High-key, bright exposure");
  if (signals.sharpness < 0.4) hints.push("Soft focus or motion blur likely");
  if (signals.edgeDensity < 0.02) hints.push("Large flat regions, little fine detail");
  if (img.naturalWidth / img.naturalHeight > 1.7) hints.push("Wide / panoramic framing");
  if (img.naturalHeight / img.naturalWidth > 1.25) hints.push("Portrait orientation");
  if (hints.length === 0) hints.push("Balanced exposure and detail — likely a natural photograph");

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    palette: kmeans(samples, 5),
    ...signals,
    focus: fw ? { x: fx / fw / w, y: fy / fw / h } : { x: 0.5, y: 0.5 },
    histogram: histogram.map((v) => v / n),
    hints,
    edges: { w, h, data: edges },
    ms: Math.round(performance.now() - start),
  };
}

type Detector<T> = new (opts?: object) => { detect(src: ImageBitmapSource): Promise<T[]> };
type DetectorWindow = {
  FaceDetector?: Detector<{ boundingBox: DOMRectReadOnly }>;
  TextDetector?: Detector<{ boundingBox: DOMRectReadOnly; rawValue: string }>;
  BarcodeDetector?: Detector<{ boundingBox: DOMRectReadOnly; rawValue: string; format: string }>;
};

export type NativeDetections = { supported: string[]; boxes: Box[]; text: string[] };

export async function detectNative(img: HTMLImageElement): Promise<NativeDetections> {
  const W = window as unknown as DetectorWindow;
  const out: NativeDetections = { supported: [], boxes: [], text: [] };
  const norm = (r: DOMRectReadOnly) => ({
    x: r.x / img.naturalWidth,
    y: r.y / img.naturalHeight,
    w: r.width / img.naturalWidth,
    h: r.height / img.naturalHeight,
  });
  // Constructors can throw (e.g. exposed but unimplemented on this platform).
  const safe = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch {}
  };
  const tasks: Promise<void>[] = [];
  const { FaceDetector, TextDetector, BarcodeDetector } = W;
  if (FaceDetector) {
    out.supported.push("faces");
    tasks.push(safe(async () => {
      (await new FaceDetector().detect(img)).forEach((f) => out.boxes.push({ ...norm(f.boundingBox), label: "face" }));
    }));
  }
  if (TextDetector) {
    out.supported.push("text");
    tasks.push(safe(async () => {
      (await new TextDetector().detect(img)).forEach((t) => {
        out.boxes.push({ ...norm(t.boundingBox), label: "text" });
        out.text.push(t.rawValue);
      });
    }));
  }
  if (BarcodeDetector) {
    out.supported.push("barcodes");
    tasks.push(safe(async () => {
      (await new BarcodeDetector().detect(img)).forEach((b) => {
        out.boxes.push({ ...norm(b.boundingBox), label: b.format });
        out.text.push(b.rawValue);
      });
    }));
  }
  await Promise.all(tasks);
  return out;
}

export type ModelVision = {
  mode: "llm";
  model: string;
  description: string;
  objects: { label: string; confidence: number; box?: [number, number, number, number] }[];
  text: string;
  answer?: string;
};

export async function requestModelVision(image: string, question?: string): Promise<ModelVision | { mode: "unconfigured" } | { mode: "error"; message: string }> {
  try {
    const res = await fetch("/api/vision", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image, question }),
    });
    const json = await res.json();
    if (res.status === 501) return { mode: "unconfigured" };
    if (!res.ok) return { mode: "error", message: json.error ?? `Request failed (${res.status})` };
    return json as ModelVision;
  } catch (e) {
    return { mode: "error", message: e instanceof Error ? e.message : "Network error" };
  }
}

// A generated sample so visitors without an image handy can try the tool.
export function createSampleImage(): string {
  const c = document.createElement("canvas");
  c.width = 960;
  c.height = 640;
  const x = c.getContext("2d")!;
  const sky = x.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, "#1b2a4a");
  sky.addColorStop(0.55, "#d9825b");
  sky.addColorStop(1, "#f3c98b");
  x.fillStyle = sky;
  x.fillRect(0, 0, 960, 640);
  x.fillStyle = "#ffe4a8";
  x.beginPath();
  x.arc(640, 360, 70, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#2a2238";
  x.beginPath();
  x.moveTo(0, 470);
  x.lineTo(180, 330);
  x.lineTo(330, 440);
  x.lineTo(520, 300);
  x.lineTo(760, 460);
  x.lineTo(960, 350);
  x.lineTo(960, 640);
  x.lineTo(0, 640);
  x.fill();
  x.fillStyle = "#15111f";
  x.fillRect(0, 540, 960, 100);
  x.fillStyle = "rgba(255,255,255,0.92)";
  x.fillRect(60, 60, 330, 120);
  x.fillStyle = "#15111f";
  x.font = "600 40px system-ui, sans-serif";
  x.fillText("AI LAB", 90, 118);
  x.font = "400 22px system-ui, sans-serif";
  x.fillText("Vision sample · 01", 90, 154);
  return c.toDataURL("image/png");
}

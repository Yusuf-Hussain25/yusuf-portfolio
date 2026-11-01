import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getEntry, imageOf, labelOf, trackOf } from "@/lib/content/catalog";
import { profile } from "@/lib/content/profile";

// Share card for each project: title, tagline and the real screenshot. Built at build time.
export const alt = `Project by ${profile.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Satori can't read WebP, so WebP covers have JPEG copies in /images/og/<slug>.jpg. */
async function cover(slug: string, image: string | null) {
  if (!image) return null;
  const file = image.endsWith(".webp") ? `/images/og/${slug}.jpg` : image;
  try {
    const data = await readFile(join(process.cwd(), "public", file));
    return `data:image/jpeg;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  const title = entry?.title ?? profile.name;
  const tagline = entry?.data.tagline ?? "";
  const hue = entry?.data.hue ?? 250;
  const shot = entry ? await cover(slug, imageOf(entry)) : null;
  const kicker = entry ? `${trackOf(entry) === "professional" ? "Professional work" : "Personal project"} · ${labelOf(entry)}` : "";
  const accent = `hsl(${hue}, 80%, 70%)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `radial-gradient(900px 500px at 85% 20%, hsla(${hue}, 80%, 55%, 0.28), transparent 70%), #07080a`,
          color: "#ededf0",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: shot ? 560 : 1072, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: accent }}>{kicker}</div>
            <div style={{ display: "flex", fontSize: title.length > 14 ? 64 : 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02, marginTop: 24 }}>{title}</div>
            <div style={{ display: "flex", fontSize: 28, lineHeight: 1.4, color: "#a8aab4", marginTop: 24 }}>{tagline}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "#ededf0" }}>
            <div style={{ display: "flex", width: 44, height: 44, borderRadius: 22, background: "#ededf0", color: "#07080a", alignItems: "center", justifyContent: "center", fontWeight: 700, marginRight: 16 }}>
              Y
            </div>
            {profile.name}
            <span style={{ color: "#7b7d86", marginLeft: 12 }}>· yusufhussain.in</span>
          </div>
        </div>
        {shot && (
          <div style={{ display: "flex", marginLeft: 48, flex: 1, alignItems: "center" }}>
            <img
              src={shot}
              alt=""
              width={520}
              height={325}
              style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        )}
      </div>
    ),
    size,
  );
}

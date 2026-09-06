import { ImageResponse } from "next/og";
import { getNamedColor } from "@/lib/named-colors";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const color = getNamedColor(slug);
  const hex = color?.hex ?? "#141414";
  const name = color?.name ?? "Named color";
  const raw = hex.replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const ink = (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#141414" : "#ffffff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: hex,
          color: ink,
          padding: 72,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
          Color name and HEX
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 12 }}>{name}</div>
        <div style={{ fontSize: 40, marginTop: 8 }}>{hex}</div>
      </div>
    ),
    { ...size },
  );
}

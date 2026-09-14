import { ImageResponse } from "next/og";
import { getWebsitePalette } from "@/lib/mockupalettes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; palette: string }>;
}) {
  const { category, palette: slug } = await params;
  const palette = getWebsitePalette(category, slug);
  const colors = palette?.colors ?? ["#141414", "#6B6660", "#E7E4DC", "#FAF9F6"];
  const name = palette?.name ?? "Website palette";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAF9F6",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {colors.map((hex) => (
            <div key={hex} style={{ flex: 1, background: hex }} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "36px 48px",
            background: "#141414",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase" }}>
            Website palette
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, marginTop: 6 }}>{name}</div>
          <div style={{ fontSize: 24, marginTop: 8 }}>{colors.join("  ")}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

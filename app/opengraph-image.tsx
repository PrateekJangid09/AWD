import { ImageResponse } from "next/og";

export const alt = "AllWebsites.Design — The Website Design Research Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#FAF9F6",
          color: "#141414",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#FF6112",
            }}
          />
          AllWebsites.Design
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              maxWidth: 960,
            }}
          >
            The website design research archive.
          </div>
          <div style={{ fontSize: 28, color: "#6B6660", maxWidth: 820 }}>
            Colour, type and technology from real websites — studied in context.
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function ogImage({
  kicker = "AllWebsites.Design",
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
}) {
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
            color: "#6B6660",
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
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, color: "#6B6660", maxWidth: 860 }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}

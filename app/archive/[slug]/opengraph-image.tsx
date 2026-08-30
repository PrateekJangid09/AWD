import { ImageResponse } from "next/og";
import { getCanonical } from "@/lib/canonical";

export const alt = "Website design record — AllWebsites.Design";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rec = getCanonical(slug);
  const name = rec?.identity.name ?? slug;
  const meta = [rec?.classification.category, rec?.classification.website_type]
    .filter(Boolean)
    .join(" · ");

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
        <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: "#6B6660" }}>
          AllWebsites.Design
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 28, color: "#6B6660" }}>
            {meta || "Website design record"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

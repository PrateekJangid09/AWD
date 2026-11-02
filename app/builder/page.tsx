import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const title = "Website Builder AI";
const description =
  "Describe a website, place free components on a full page, edit them, and download the site. It runs in your browser, with no signup required.";

export const metadata: Metadata = pageMeta({
  title,
  description,
  path: "/builder",
});

function pinnedId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^[A-Za-z0-9_-]{1,80}$/.test(raw)) return null;
  return raw;
}

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string | string[] }>;
}) {
  const { with: pinned } = await searchParams;
  const id = pinnedId(pinned);
  const src = id
    ? `/webpalette/builder.html?with=${encodeURIComponent(id)}`
    : "/webpalette/builder.html";

  return (
    <>
      <h1 className="sr-only">Website Builder AI</h1>
      <iframe
        title="Website Builder AI"
        src={src}
        className="block h-[calc(100dvh-4rem)] w-full border-0 bg-white"
      />
    </>
  );
}

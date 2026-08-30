"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9336436557815535";

export default function AdSense() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;

    const arm = () => setReady(true);
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(arm, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(arm, 3500);
    }

    return () => {
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <Script
      id="adsense"
      async
      src={SRC}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

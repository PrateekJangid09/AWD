"use client";

import { useEffect, useRef } from "react";
import { CONSENT_EVENT, isCrawler, readConsent } from "@/lib/consent";
import { GA_HEAD_SCRIPT, GA_ID, GTM_HEAD_SCRIPT } from "@/components/Tracking";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9336436557815535";

function appendScript(
  id: string,
  init: (el: HTMLScriptElement) => void,
) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  init(el);
  document.head.appendChild(el);
}

function loadAnalytics() {
  appendScript("aw-gtm", (el) => {
    el.textContent = GTM_HEAD_SCRIPT;
  });
  appendScript("aw-gtag-loader", (el) => {
    el.async = true;
    el.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  });
  appendScript("aw-gtag-config", (el) => {
    el.textContent = GA_HEAD_SCRIPT;
  });
}

function loadAdSense() {
  appendScript("aw-adsense", (el) => {
    el.async = true;
    el.src = ADSENSE_SRC;
    el.crossOrigin = "anonymous";
  });
}

export default function ConsentScripts() {
  const loaded = useRef({ analytics: false, marketing: false });

  useEffect(() => {
    function apply() {
      if (isCrawler()) return;

      const consent = readConsent();
      if (!consent) return;

      if (consent.analytics && !loaded.current.analytics) {
        loadAnalytics();
        loaded.current.analytics = true;
      }
      if (consent.marketing && !loaded.current.marketing) {
        loadAdSense();
        loaded.current.marketing = true;
      }
    }

    apply();
    window.addEventListener(CONSENT_EVENT, apply);
    return () => window.removeEventListener(CONSENT_EVENT, apply);
  }, []);

  return null;
}

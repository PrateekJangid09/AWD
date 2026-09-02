export const CONSENT_KEY = "aw-cookie-consent";
export const CONSENT_EVENT = "aw-consent-change";

export type ConsentPrefs = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const BOT =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|w3c_validator|redditbot|applebot|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|chrome-lighthouse|telegrambot|petalbot|semrushbot|ahrefsbot|mj12bot|dotbot/i;

export function isCrawler(userAgent?: string): boolean {
  const ua =
    userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return BOT.test(ua);
}

export function readConsent(): ConsentPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      value?: string;
      prefs?: ConsentPrefs;
    };
    if (parsed.prefs) return parsed.prefs;
    if (parsed.value === "all") {
      return { analytics: true, functional: true, marketing: true };
    }
    if (parsed.value === "essential") {
      return { analytics: false, functional: false, marketing: false };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveConsent(prefs: ConsentPrefs, label: string) {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ value: label, prefs, at: new Date().toISOString() }),
  );
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

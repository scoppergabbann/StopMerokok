"use client";

export type AnalyticsEventName =
  | "celebration_viewed"
  | "check_in_submit"
  | "community_post"
  | "feedback_submit"
  | "login"
  | "pwa_install_prompt"
  | "register"
  | "reminder_enabled"
  | "share_card_caption_copied"
  | "share_card_downloaded"
  | "share_card_shared";

type AnalyticsPayload = Record<
  string,
  boolean | null | number | string | undefined
>;

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  path: string;
  payload: AnalyticsPayload;
  timestamp: string;
};

const analyticsStorageKey = "stopmerokok.analytics.events";
const maxStoredEvents = 200;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function readStoredEvents() {
  try {
    const raw = window.localStorage.getItem(analyticsStorageKey);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function persistEvent(event: AnalyticsEvent) {
  const nextEvents = [...readStoredEvents(), event].slice(-maxStoredEvents);
  window.localStorage.setItem(analyticsStorageKey, JSON.stringify(nextEvents));
}

export function trackEvent(
  name: AnalyticsEventName,
  payload: AnalyticsPayload = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  const event: AnalyticsEvent = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    path: window.location.pathname,
    payload,
    timestamp: new Date().toISOString(),
  };

  try {
    persistEvent(event);
  } catch {
    // Analytics should never interrupt the habit-tracking flow.
  }

  window.dispatchEvent(
    new CustomEvent("stopmerokok:analytics", { detail: event }),
  );

  window.dataLayer?.push({
    event: `stopmerokok_${name}`,
    ...payload,
  });
}

export function getStoredAnalyticsEvents() {
  if (typeof window === "undefined") {
    return [];
  }

  return readStoredEvents();
}

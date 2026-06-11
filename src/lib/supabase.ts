import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;

const AUTH_SESSION_EXPIRES_AT_KEY = "stopmerokok.authSessionExpiresAt";
const AUTH_BROWSER_SESSION_KEY = "stopmerokok.authBrowserSession";

export function rememberAuthSession(days = 7) {
  if (typeof window === "undefined") {
    return;
  }

  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(AUTH_SESSION_EXPIRES_AT_KEY, String(expiresAt));
  window.sessionStorage.removeItem(AUTH_BROWSER_SESSION_KEY);
}

export function clearRememberedAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_EXPIRES_AT_KEY);
  window.sessionStorage.removeItem(AUTH_BROWSER_SESSION_KEY);
}

export function rememberAuthForBrowserSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_EXPIRES_AT_KEY);
  window.sessionStorage.setItem(AUTH_BROWSER_SESSION_KEY, "true");
}

export function hasRememberedAuthSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(AUTH_SESSION_EXPIRES_AT_KEY));
}

export function hasBrowserSessionAuth() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(AUTH_BROWSER_SESSION_KEY) === "true";
}

export function hasRememberedAuthSessionExpired() {
  if (typeof window === "undefined") {
    return false;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_EXPIRES_AT_KEY);

  if (!raw) {
    return false;
  }

  const expiresAt = Number(raw);
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

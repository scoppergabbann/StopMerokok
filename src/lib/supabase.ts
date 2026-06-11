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

export function rememberAuthSession(days = 7) {
  if (typeof window === "undefined") {
    return;
  }

  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(AUTH_SESSION_EXPIRES_AT_KEY, String(expiresAt));
}

export function clearRememberedAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_EXPIRES_AT_KEY);
}

export function ensureRememberedAuthSession(days = 7) {
  if (typeof window === "undefined") {
    return;
  }

  if (window.localStorage.getItem(AUTH_SESSION_EXPIRES_AT_KEY)) {
    return;
  }

  rememberAuthSession(days);
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

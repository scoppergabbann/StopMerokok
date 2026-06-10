"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          callback: (token: string) => void;
          "error-callback": () => void;
          "expired-callback": () => void;
          sitekey: string;
          theme: "light";
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

type TurnstileCaptchaProps = {
  onTokenChange: (token: string) => void;
};

export type TurnstileCaptchaHandle = {
  reset: () => void;
};

export const hasTurnstileSiteKey = Boolean(turnstileSiteKey);

export const TurnstileCaptcha = forwardRef<
  TurnstileCaptchaHandle,
  TurnstileCaptchaProps
>(function TurnstileCaptcha({ onTokenChange }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        onTokenChange("");

        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }),
    [onTokenChange],
  );

  useEffect(() => {
    if (!turnstileSiteKey || widgetIdRef.current) {
      return;
    }

    function renderCaptcha() {
      if (
        !window.turnstile ||
        !containerRef.current ||
        widgetIdRef.current
      ) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        callback: onTokenChange,
        "error-callback": () => onTokenChange(""),
        "expired-callback": () => onTokenChange(""),
        sitekey: turnstileSiteKey,
        theme: "light",
      });
    }

    if (window.turnstile) {
      renderCaptcha();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderCaptcha, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.addEventListener("load", renderCaptcha, { once: true });
    document.head.appendChild(script);
  }, [onTokenChange]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      {turnstileSiteKey ? (
        <div ref={containerRef} />
      ) : (
        <p className="text-sm font-bold leading-6 text-slate-500">
          CAPTCHA belum dikonfigurasi.
        </p>
      )}
    </div>
  );
});

"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const dismissCountStorageKey = "stopmerokok.pwa-install.dismiss-count";
const installedStorageKey = "stopmerokok.pwa-install.installed";
const nextPromptStorageKey = "stopmerokok.pwa-install.next-prompt-at";
const promptCooldownDays = [1, 3, 7, 14, 30];

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function hasInstalledApp() {
  return window.localStorage.getItem(installedStorageKey) === "true";
}

function canShowPromptNow() {
  const nextPromptAt = Number(
    window.localStorage.getItem(nextPromptStorageKey) ?? 0,
  );

  return !nextPromptAt || Date.now() >= nextPromptAt;
}

function scheduleNextPrompt() {
  const currentCount = Number(
    window.localStorage.getItem(dismissCountStorageKey) ?? 0,
  );
  const nextCount = currentCount + 1;
  const cooldownDays =
    promptCooldownDays[
      Math.min(nextCount - 1, promptCooldownDays.length - 1)
    ];
  const nextPromptAt = Date.now() + cooldownDays * 24 * 60 * 60 * 1000;

  window.localStorage.setItem(dismissCountStorageKey, String(nextCount));
  window.localStorage.setItem(nextPromptStorageKey, String(nextPromptAt));
}

function markAppInstalled() {
  window.localStorage.setItem(installedStorageKey, "true");
  window.localStorage.removeItem(dismissCountStorageKey);
  window.localStorage.removeItem(nextPromptStorageKey);
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneMode() || hasInstalledApp()) {
      markAppInstalled();
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      const nextPrompt = event as BeforeInstallPromptEvent;
      setInstallPrompt(nextPrompt);

      if (canShowPromptNow()) {
        setIsVisible(true);
        trackEvent("pwa_install_prompt", { action: "shown" });
      }
    }

    function handleAppInstalled() {
      markAppInstalled();
      setInstallPrompt(null);
      setIsVisible(false);
      trackEvent("pwa_install_prompt", { action: "installed" });
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      return;
    }

    trackEvent("pwa_install_prompt", { action: "clicked" });
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    trackEvent("pwa_install_prompt", {
      action: choice.outcome,
      platform: choice.platform,
    });

    if (choice.outcome === "accepted") {
      markAppInstalled();
    } else {
      scheduleNextPrompt();
    }

    setInstallPrompt(null);
    setIsVisible(false);
  }

  function dismissPrompt() {
    scheduleNextPrompt();
    trackEvent("pwa_install_prompt", { action: "dismissed" });
    setIsVisible(false);
  }

  if (!isVisible || !installPrompt) {
    return null;
  }

  return (
    <div className="shimmer-card fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-[1.5rem] border border-[#DFF3E8] bg-white p-4 shadow-2xl shadow-slate-400/30">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
          <Download className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-[#1F2933]">
            Pasang StopMerokok
          </p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
            Buka lebih cepat seperti aplikasi dan lanjut absen harian dari
            layar utama.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded-2xl bg-[#4FAE7B] px-4 py-2 text-sm font-extrabold text-white"
              onClick={installApp}
              type="button"
            >
              Pasang
            </button>
            <button
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-600"
              onClick={dismissPrompt}
              type="button"
            >
              Nanti
            </button>
          </div>
        </div>
        <button
          aria-label="Tutup ajakan pemasangan"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"
          onClick={dismissPrompt}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

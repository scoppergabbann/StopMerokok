"use client";

import { useEffect } from "react";
import {
  loadCheckins,
  loadNotificationSettings,
  persistNotificationSettings,
} from "@/lib/client-data";
import { todayKey } from "@/lib/mvp-store";

function canNotify() {
  return typeof window !== "undefined" && "Notification" in window;
}

async function showReminderNotification() {
  const title = "Jangan lupa absen hari ini";
  const options: NotificationOptions = {
    body: "Catat sebentar saja. Jujur hari ini lebih penting daripada sempurna.",
    icon: "/images/icon-192.png",
    tag: "daily-checkin-reminder",
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  }

  new Notification(title, options);
}

export function NotificationReminder() {
  useEffect(() => {
    if (!canNotify()) {
      return;
    }

    const runReminder = async () => {
      const settings = await loadNotificationSettings();

      if (!settings.enabled || Notification.permission !== "granted") {
        return;
      }

      const now = new Date();
      const today = todayKey();
      const checkins = await loadCheckins();
      const hasCheckedInToday = checkins.some(
        (checkin) => checkin.date === today,
      );
      const shouldRemind =
        now.getHours() >= settings.reminderHour &&
        settings.lastNotifiedDate !== today &&
        !hasCheckedInToday;

      if (!shouldRemind) {
        return;
      }

      await showReminderNotification();
      await persistNotificationSettings({
        ...settings,
        lastNotifiedDate: today,
      });
    };

    runReminder();
    const id = window.setInterval(runReminder, 60 * 1000);

    return () => window.clearInterval(id);
  }, []);

  return null;
}

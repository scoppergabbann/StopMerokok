"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import {
  loadNotificationSettings,
  persistNotificationSettings,
} from "@/lib/client-data";

function getPermissionLabel(permission: NotificationPermission | "unsupported") {
  if (permission === "granted") {
    return "Aktif";
  }

  if (permission === "denied") {
    return "Diblokir";
  }

  if (permission === "unsupported") {
    return "Tidak didukung";
  }

  return "Belum aktif";
}

export function NotificationOptIn() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [isEnabled, setIsEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(20);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPermission("Notification" in window ? Notification.permission : "unsupported");
      loadNotificationSettings().then((settings) => {
        setIsEnabled(settings.enabled);
        setReminderHour(settings.reminderHour);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  async function enableNotifications() {
    if (!("Notification" in window)) {
      showToast({
        message: "Browser ini belum mendukung notifikasi.",
        title: "Notifikasi tidak tersedia",
        variant: "info",
      });
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission !== "granted") {
      showToast({
        message: "Kamu bisa mengaktifkannya lagi dari pengaturan browser.",
        title: "Notifikasi belum diizinkan",
        variant: "info",
      });
      return;
    }

    await persistNotificationSettings({
      enabled: true,
      reminderHour,
    });
    setIsEnabled(true);
    showToast({
      message: `Kami akan mengingatkan sekitar pukul ${String(reminderHour).padStart(2, "0")}:00 kalau kamu belum check-in.`,
      title: "Reminder aktif",
      variant: "success",
    });
  }

  async function disableNotifications() {
    await persistNotificationSettings({
      enabled: false,
      reminderHour,
    });
    setIsEnabled(false);
    showToast({
      message: "Reminder check-in harian dimatikan.",
      title: "Reminder nonaktif",
      variant: "info",
    });
  }

  async function updateReminderHour(nextHour: number) {
    setReminderHour(nextHour);
    await persistNotificationSettings({
      enabled: isEnabled,
      reminderHour: nextHour,
    });
    showToast({
      message: `Reminder diatur ke pukul ${String(nextHour).padStart(2, "0")}:00.`,
      title: "Jam reminder tersimpan",
      variant: "success",
    });
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#E3F3F7] text-[#36798D]">
            <BellRing className="size-6" />
          </span>
          <div>
            <p className="text-xl font-extrabold">Reminder check-in</p>
            <p className="mt-1 leading-7 text-slate-600">
              Dapatkan notifikasi malam hari kalau kamu belum mengisi absen.
            </p>
            <p className="mt-2 text-sm font-bold text-slate-500">
              Status: {isEnabled ? "Aktif" : getPermissionLabel(permission)} ·{" "}
              {String(reminderHour).padStart(2, "0")}:00
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <label className="text-sm font-bold text-slate-600">
            Jam reminder
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
              onChange={(event) => updateReminderHour(Number(event.target.value))}
              value={reminderHour}
            >
              {Array.from({ length: 10 }, (_, index) => index + 12).map(
                (hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ),
              )}
            </select>
          </label>

          {isEnabled ? (
            <button
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700"
              onClick={disableNotifications}
              type="button"
            >
              Matikan
            </button>
          ) : (
            <button
              className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={permission === "denied" || permission === "unsupported"}
              onClick={enableNotifications}
              type="button"
            >
              Aktifkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

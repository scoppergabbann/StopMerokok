"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import { trackEvent } from "@/lib/analytics";
import { loadCheckins, persistCheckin } from "@/lib/client-data";
import {
  feedbackForStatus,
  getCurrentSmokeFreeStreak,
  getStreakBadge,
  todayKey,
  type DailyCheckin,
  type CheckinStatus,
  type Mood,
} from "@/lib/mvp-store";

const moods: Mood[] = ["Tenang", "Stres", "Senang", "Capek", "Sedih", "Semangat"];
const triggers = [
  "Stres",
  "Nongkrong",
  "Kopi",
  "Kerjaan",
  "Marah / sedih",
  "Kebiasaan setelah makan",
  "Lainnya",
];

const options: Array<{
  description: string;
  label: string;
  status: CheckinStatus;
}> = [
  {
    description: "Hari ini tidak merokok sama sekali.",
    label: "Hari ini saya tidak merokok",
    status: "smoke_free",
  },
  {
    description: "Masih merokok, tapi lebih sedikit dari biasanya.",
    label: "Hari ini saya mengurangi",
    status: "reduced",
  },
  {
    description: "Hari ini merokok seperti biasa atau lebih banyak.",
    label: "Hari ini saya kambuh",
    status: "relapsed",
  },
];

export default function CheckInPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CheckinStatus>("smoke_free");
  const [date, setDate] = useState(todayKey());
  const [existingCheckin, setExistingCheckin] = useState<DailyCheckin | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const selectedDate = params.get("date") || todayKey();

      setDate(selectedDate);
      loadCheckins().then((items) => {
        const match = items.find((item) => item.date === selectedDate) ?? null;
        setExistingCheckin(match);

        if (match) {
          setStatus(match.status);
        }
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Absen
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          {date === todayKey() ? "Absen hari ini" : "Koreksi absen"}
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Pilih tanggal yang mau dicatat atau dikoreksi. Ini bukan ujian, ini
          bahan belajar untuk dirimu.
        </p>

        {feedback && (
          <div className="mt-6 rounded-[2rem] bg-[#DFF3E8] p-5 text-[#2F7D57]">
            <p className="text-lg font-extrabold">{feedback}</p>
          </div>
        )}

        <form
          className="mt-6 space-y-5 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70"
          key={`${date}-${existingCheckin?.createdAt ?? "new"}`}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const smokedCount =
              status === "smoke_free" ? 0 : Number(form.get("smokedCount") || 0);
            const existingItems = await loadCheckins();
            const previousCheckin = [...existingItems]
              .filter((item) => item.date < date)
              .sort((a, b) => b.date.localeCompare(a.date))[0];
            const nextCheckin: DailyCheckin = {
              createdAt: new Date().toISOString(),
              date,
              mood: String(form.get("mood") || "") as Mood,
              note: String(form.get("note") || ""),
              smokedCount,
              status,
              trigger:
                status === "relapsed" ? String(form.get("trigger") || "") : "",
            };

            await persistCheckin(nextCheckin);

            const nextItems = [
              ...existingItems.filter((item) => item.date !== date),
              nextCheckin,
            ].sort((a, b) => a.date.localeCompare(b.date));
            const smokeFreeStreak = getCurrentSmokeFreeStreak(nextItems);
            const activeBadge = getStreakBadge(smokeFreeStreak);
            const milestone = [7, 30, 90, 180, 365].includes(smokeFreeStreak)
              ? {
                  badge:
                    smokeFreeStreak === 7
                      ? "7 Hari Tarik Nafas Baru"
                      : activeBadge,
                  description:
                    smokeFreeStreak === 7
                      ? "Kamu sudah membangun 7 hari keberanian."
                      : `${smokeFreeStreak} hari bertahan. Pelan-pelan, ini makin nyata.`,
                  streak: smokeFreeStreak,
                }
              : null;
            const isComeback =
              previousCheckin?.status === "relapsed" && status !== "relapsed";

            trackEvent("check_in_submit", {
              date,
              hasNote: Boolean(nextCheckin.note),
              isComeback,
              isCorrection: Boolean(existingCheckin),
              status,
              streak: smokeFreeStreak,
            });

            const message = feedbackForStatus(status);
            setFeedback(message);
            showToast({
              message,
              title: existingCheckin ? "Absen diperbarui" : "Absen tersimpan",
              variant: "success",
            });
            window.sessionStorage.setItem(
              "stopmerokok.celebration",
              JSON.stringify({
                dayNumber: nextItems.length,
                isComeback,
                milestone,
                status,
                streak: smokeFreeStreak,
              }),
            );
            router.push("/check-in/celebration");
          }}
        >
          <label className="block">
            <span className="text-sm font-bold text-slate-600">
              Tanggal absen
            </span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              max={todayKey()}
              onChange={(event) => {
                const nextDate = event.target.value;
                setDate(nextDate);
                loadCheckins().then((items) => {
                  const match =
                    items.find((item) => item.date === nextDate) ?? null;
                  setExistingCheckin(match);
                  setStatus(match?.status ?? "smoke_free");
                });
              }}
              required
              type="date"
              value={date}
            />
          </label>

          <div className="grid gap-3">
            {options.map((option) => (
              <button
                className={`rounded-3xl border p-4 text-left transition ${
                  status === option.status
                    ? "border-[#4FAE7B] bg-[#DFF3E8]"
                    : "border-slate-200 bg-white"
                }`}
                key={option.status}
                onClick={() => setStatus(option.status)}
                type="button"
              >
                <span className="block font-extrabold">{option.label}</span>
                <span className="mt-1 block text-sm font-medium text-slate-600">
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          {status !== "smoke_free" && (
            <label className="block">
              <span className="text-sm font-bold text-slate-600">
                Berapa batang rokok hari ini?
              </span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                defaultValue={
                  existingCheckin?.status === "smoke_free"
                    ? undefined
                    : existingCheckin?.smokedCount
                }
                min={0}
                name="smokedCount"
                required
                type="number"
              />
            </label>
          )}

          {status === "relapsed" && (
            <label className="block">
              <span className="text-sm font-bold text-slate-600">
                Apa pemicunya?
              </span>
              <select
                className="select-input mt-2"
                defaultValue={existingCheckin?.trigger}
                name="trigger"
                required
              >
                {triggers.map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {trigger}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-bold text-slate-600">
              Perasaan hari ini
            </span>
            <select
              className="select-input mt-2"
              defaultValue={existingCheckin?.mood}
              name="mood"
            >
              {moods.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-600">
              Catatan hari ini
            </span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              defaultValue={existingCheckin?.note}
              name="note"
              placeholder="Opsional. Tulis apa yang kamu rasakan hari ini."
            />
          </label>

          <button className="w-full rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20">
            {existingCheckin ? "Simpan koreksi" : "Simpan absen"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

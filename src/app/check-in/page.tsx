"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import {
  feedbackForStatus,
  saveCheckin,
  todayKey,
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
  const [status, setStatus] = useState<CheckinStatus>("smoke_free");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { showToast } = useToast();

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Check-in
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Absen hari ini</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Jawab dengan jujur. Ini bukan ujian, ini bahan belajar untuk dirimu.
        </p>

        {feedback && (
          <div className="mt-6 rounded-[2rem] bg-[#DFF3E8] p-5 text-[#2F7D57]">
            <p className="text-lg font-extrabold">{feedback}</p>
          </div>
        )}

        <form
          className="mt-6 space-y-5 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const smokedCount =
              status === "smoke_free" ? 0 : Number(form.get("smokedCount") || 0);

            saveCheckin({
              createdAt: new Date().toISOString(),
              date: todayKey(),
              mood: String(form.get("mood") || "") as Mood,
              note: String(form.get("note") || ""),
              smokedCount,
              status,
              trigger:
                status === "relapsed" ? String(form.get("trigger") || "") : "",
            });

            const message = feedbackForStatus(status);
            setFeedback(message);
            showToast({
              message,
              title: "Absen tersimpan",
              variant: "success",
            });
          }}
        >
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
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
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
              Mood hari ini
            </span>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
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
              name="note"
              placeholder="Opsional. Tulis apa yang kamu rasakan hari ini."
            />
          </label>

          <button className="w-full rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20">
            Simpan absen
          </button>
        </form>
      </section>
    </AppShell>
  );
}

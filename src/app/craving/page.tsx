"use client";

import { CheckCircle2, Droplets, Footprints, MessageCircle, Timer, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import { persistCravingLog } from "@/lib/client-data";

const checklist = [
  { icon: Droplets, label: "Minum air putih" },
  { icon: Footprints, label: "Jalan sebentar" },
  { icon: Wind, label: "Tarik napas pelan" },
  { icon: CheckCircle2, label: "Jauhkan rokok" },
  { icon: MessageCircle, label: "Chat teman" },
];

const totalSeconds = 5 * 60;

export default function CravingPage() {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [checked, setChecked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isDone, setIsDone] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (secondsLeft <= 0 || isDone) {
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isDone, secondsLeft]);

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const time = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  async function save(status: "passed" | "smoked") {
    await persistCravingLog({
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      note,
      status,
    });

    setIsDone(true);
    showToast({
      message:
        status === "passed"
          ? "Kamu berhasil melewati satu craving. Ini layak dihargai."
          : "Tidak apa-apa. Catatan ini tetap membantu kamu memahami pola.",
      title: status === "passed" ? "Craving terlewati" : "Tetap mulai lagi",
      variant: status === "passed" ? "success" : "info",
    });
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Emergency
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Saya lagi ingin merokok
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Craving biasanya datang seperti ombak. Naik, tinggi, lalu turun.
          Tahan 5 menit dulu.
        </p>

        <div className="mt-6 rounded-[2rem] bg-[#1F2933] p-6 text-white shadow-xl shadow-slate-300/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#9DE5BD]">
                Timer bantuan cepat
              </p>
              <p className="mt-2 text-6xl font-extrabold">{time}</p>
            </div>
            <Timer className="size-12 text-[#9DE5BD]" />
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#4FAE7B]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-5 text-lg font-bold leading-8 text-slate-200">
            Tarik napas 4 detik, tahan 2 detik, keluarkan pelan 6 detik.
            Ulangi sampai tubuhmu sedikit lebih tenang.
          </p>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Checklist cepat</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => {
              const Icon = item.icon;
              const isChecked = checked.includes(item.label);

              return (
                <button
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left font-bold transition ${
                    isChecked
                      ? "border-[#4FAE7B] bg-[#DFF3E8] text-[#2F7D57]"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  key={item.label}
                  onClick={() =>
                    setChecked((current) =>
                      current.includes(item.label)
                        ? current.filter((label) => label !== item.label)
                        : [...current, item.label],
                    )
                  }
                  type="button"
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-6 block rounded-[2rem] bg-white p-5 shadow-sm">
          <span className="text-sm font-bold text-slate-600">
            Catatan singkat
          </span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Apa yang memicu craving ini?"
            value={note}
          />
        </label>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
            onClick={() => save("passed")}
            type="button"
          >
            Saya berhasil melewati craving
          </button>
          <button
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700"
            onClick={() => save("smoked")}
            type="button"
          >
            Saya tetap merokok
          </button>
        </div>

        {isDone && (
          <Link
            className="mt-5 inline-flex rounded-2xl bg-[#E3F3F7] px-5 py-3 font-extrabold text-[#36798D]"
            href="/dashboard"
          >
            Kembali ke dashboard
          </Link>
        )}
      </section>
    </AppShell>
  );
}

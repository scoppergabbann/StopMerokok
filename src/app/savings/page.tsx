"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import {
  calculateSummary,
  formatRupiahInput,
  formatRupiah,
  parseRupiahInput,
  readCheckins,
  readProfile,
  readReward,
  saveReward,
  type DailyCheckin,
  type Profile,
  type Reward,
} from "@/lib/mvp-store";

const donationTargets = [
  "Anak yatim",
  "Fakir miskin",
  "Lansia",
  "Keluarga",
  "Masjid",
  "Panti asuhan",
];

export default function SavingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [reward, setReward] = useState<Reward | null>(null);
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      setProfile(readProfile());
      setCheckins(readCheckins());
      setReward(readReward());
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = calculateSummary(profile, checkins);

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Berbagi
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Savings jadi kebaikan</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Hari ini kamu tidak cuma menahan rokok. Kamu juga menabung kebaikan.
        </p>

        <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm font-bold text-slate-500">Total uang dihemat</p>
          <p className="mt-2 text-5xl font-extrabold">
            {formatRupiah(summary.savedMoney)}
          </p>
          <p className="mt-3 font-medium leading-7 text-slate-600">
            Dari {summary.avoidedSticks} batang rokok yang berhasil kamu
            hindari.
          </p>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Target reward / donasi</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Tentukan tujuan agar savings terasa punya makna.
          </p>
          <form
            className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const targetAmount = parseRupiahInput(targetAmountInput);

              if (targetAmount <= 0) {
                showToast({
                  message: "Isi nominal target, misalnya Rp10.000.",
                  title: "Nominal belum valid",
                  variant: "info",
                });
                return;
              }

              const nextReward = {
                createdAt: new Date().toISOString(),
                targetAmount,
                title: String(form.get("title") || "Target kebaikan"),
              };

              saveReward(nextReward);
              setReward(nextReward);
              showToast({
                message: "Target savings kamu sudah diperbarui.",
                title: "Target tersimpan",
                variant: "success",
              });
              event.currentTarget.reset();
              setTargetAmountInput("");
            }}
          >
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              name="title"
              placeholder="Contoh: Donasi anak yatim"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              inputMode="numeric"
              onChange={(event) =>
                setTargetAmountInput(formatRupiahInput(event.target.value))
              }
              placeholder="Rp10.000"
              required
              type="text"
              value={targetAmountInput}
            />
            <button className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white">
              Simpan
            </button>
          </form>
          {reward && (
            <div className="mt-5 rounded-2xl bg-[#DFF3E8] p-4">
              <p className="font-extrabold">{reward.title}</p>
              <p className="mt-1 text-sm font-semibold text-[#2F7D57]">
                Progress {formatRupiah(summary.savedMoney)} dari{" "}
                {formatRupiah(reward.targetAmount)}
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-[#4FAE7B]"
                  style={{
                    width: `${Math.min(
                      100,
                      reward.targetAmount > 0
                        ? (summary.savedMoney / reward.targetAmount) * 100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {donationTargets.map((target) => (
            <button
              className="rounded-[1.5rem] border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-[#4FAE7B]"
              key={target}
              onClick={() =>
                showToast({
                  message: `${target} bisa kamu jadikan ide target donasi berikutnya.`,
                  title: "Ide berbagi dipilih",
                  variant: "info",
                })
              }
              type="button"
            >
              <p className="font-extrabold">{target}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Sisihkan sebagian savings untuk target ini.
              </p>
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

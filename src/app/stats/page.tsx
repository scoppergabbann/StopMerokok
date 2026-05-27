"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { loadCheckins, loadProfile } from "@/lib/client-data";
import {
  calculateSummary,
  formatRupiah,
  getRelapseInsights,
  statusLabels,
  statusStyles,
  type DailyCheckin,
  type Profile,
} from "@/lib/mvp-store";

export default function StatsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProfile().then(setProfile);
      loadCheckins().then(setCheckins);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = calculateSummary(profile, checkins);
  const insights = getRelapseInsights(checkins);
  const maxSmoked = Math.max(1, ...checkins.map((item) => item.smokedCount));

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Statistic
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Statistik progress</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Lihat pola sederhana dari check-in yang sudah kamu isi.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Longest streak</p>
            <p className="mt-2 text-2xl font-extrabold">
              {summary.longestStreak} hari
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Uang dihemat</p>
            <p className="mt-2 text-2xl font-extrabold">
              {formatRupiah(summary.savedMoney)}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Kambuh</p>
            <p className="mt-2 text-2xl font-extrabold">
              {summary.relapseDays} hari
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-xl font-extrabold">Rokok per hari</h2>
          {checkins.length === 0 ? (
            <p className="mt-4 leading-7 text-slate-600">
              Belum ada data. Mulai dari satu absen kecil hari ini.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {checkins.slice(-10).map((checkin) => (
                <div key={checkin.date}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">
                      {checkin.date}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        statusStyles[checkin.status]
                      }`}
                    >
                      {statusLabels[checkin.status]}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4FAE7B]"
                      style={{
                        width: `${(checkin.smokedCount / maxSmoked) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {checkin.smokedCount} batang
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[2rem] bg-[#E3F3F7] p-5">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Insight kambuh
          </p>
          {insights.relapseCount === 0 ? (
            <p className="mt-3 text-lg font-bold leading-8">
              Belum ada data kambuh. Kalau suatu hari terjadi, catatanmu akan
              membantu membaca polanya.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/75 p-4">
                <p className="text-sm font-bold text-slate-500">
                  Trigger paling sering
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  {insights.topTrigger?.name ?? "Belum tercatat"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {insights.topTrigger
                    ? `${insights.topTrigger.count} kali muncul saat kambuh.`
                    : "Isi trigger saat check-in kambuh."}
                </p>
              </div>
              <div className="rounded-2xl bg-white/75 p-4">
                <p className="text-sm font-bold text-slate-500">
                  Mood saat kambuh
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  {insights.topMood?.name ?? "Belum tercatat"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Coba siapkan alternatif kecil sebelum mood ini memuncak.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

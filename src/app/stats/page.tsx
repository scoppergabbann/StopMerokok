"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import {
  loadCheckins,
  loadLeaderboard,
  loadProfile,
  removeCheckin,
} from "@/lib/client-data";
import {
  calculateSummary,
  formatRupiah,
  getRelapseInsights,
  statusLabels,
  statusStyles,
  type DailyCheckin,
  type LeaderboardEntry,
  type Profile,
} from "@/lib/mvp-store";

export default function StatsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([loadProfile(), loadCheckins()]).then(
        ([nextProfile, nextCheckins]) => {
          setProfile(nextProfile);
          setCheckins(nextCheckins);
          loadLeaderboard(nextProfile, nextCheckins).then(setLeaderboard);
        },
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = calculateSummary(profile, checkins);
  const insights = getRelapseInsights(checkins);
  const maxSmoked = Math.max(1, ...checkins.map((item) => item.smokedCount));
  const recentCheckins = [...checkins]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  async function handleDeleteCheckin(date: string) {
    const confirmed = window.confirm(
      `Hapus data absen tanggal ${date}? Data yang sudah dihapus tidak bisa dikembalikan.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingDate(date);

    try {
      await removeCheckin(date);
      const nextCheckins = checkins.filter((item) => item.date !== date);
      setCheckins(nextCheckins);
      loadLeaderboard(profile, nextCheckins).then(setLeaderboard);
      showToast({
        message: "Data absen berhasil dihapus dari statistik.",
        title: "Absen terhapus",
        variant: "success",
      });
    } catch {
      showToast({
        message: "Coba lagi sebentar lagi.",
        title: "Gagal menghapus absen",
        variant: "info",
      });
    } finally {
      setDeletingDate(null);
    }
  }

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                Leaderboard
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Ranking streak bebas rokok
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Peserta hanya masuk ranking kalau masih check-in bebas rokok
                beruntun sampai hari ini. Satu hari terlewat atau kambuh,
                otomatis gugur dari leaderboard aktif.
              </p>
            </div>
            <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
              {leaderboard.length} aktif
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {leaderboard.length === 0 ? (
              <p className="rounded-2xl bg-[#F6F8F7] p-4 font-semibold text-slate-600">
                Belum ada peserta aktif. Masuk ranking dimulai dari check-in
                bebas rokok hari ini.
              </p>
            ) : (
              leaderboard.map((entry) => (
                <div
                  className="grid gap-4 rounded-2xl border border-slate-100 bg-[#F6F8F7] p-4 sm:grid-cols-[56px_1fr_auto]"
                  key={`${entry.rank}-${entry.name}`}
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-white text-lg font-extrabold text-[#2F7D57]">
                    #{entry.rank}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold">{entry.name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Streak bebas rokok aktif {entry.currentStreak} hari
                      {entry.checkinCount > 0
                        ? ` - ${entry.checkinCount}x total absen`
                        : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold">
                      {entry.activeBadge && (
                        <span className="rounded-full bg-[#E3F3F7] px-3 py-1 text-[#36798D]">
                          {entry.activeBadge}
                        </span>
                      )}
                      <span className="rounded-full bg-[#DFF3E8] px-3 py-1 text-[#2F7D57]">
                        Bebas {entry.smokeFreeDays}
                      </span>
                      <span className="rounded-full bg-[#FFF4CC] px-3 py-1 text-[#9B6B00]">
                        Mengurangi {entry.reducedDays}
                      </span>
                      <span className="rounded-full bg-[#FBE3E3] px-3 py-1 text-[#B75D5D]">
                        Kambuh {entry.relapseDays}
                      </span>
                    </div>
                  </div>
                  <div className="self-center rounded-2xl bg-white px-4 py-3 text-left sm:text-right">
                    <p className="text-xs font-bold text-slate-500">Streak</p>
                    <p className="text-xl font-extrabold">
                      {entry.currentStreak} hari
                    </p>
                    {entry.lastCheckin && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Last: {entry.lastCheckin}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
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

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                Riwayat activity
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Check-in terbaru
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Data activity sekarang tersedia di statistik. Kamu tetap bisa
                koreksi atau hapus absen yang sudah berlalu.
              </p>
            </div>
            <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
              {checkins.length} catatan
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {recentCheckins.length === 0 ? (
              <p className="rounded-2xl bg-[#F6F8F7] p-4 font-semibold text-slate-600">
                Belum ada riwayat. Mulai dari check-in hari ini.
              </p>
            ) : (
              recentCheckins.map((checkin) => (
                <article
                  className="rounded-2xl border border-slate-100 bg-[#F6F8F7] p-4"
                  key={checkin.date}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-extrabold">{checkin.date}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {checkin.smokedCount} batang
                        {checkin.mood ? ` - Mood: ${checkin.mood}` : ""}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${
                        statusStyles[checkin.status]
                      }`}
                    >
                      {statusLabels[checkin.status]}
                    </span>
                  </div>

                  {checkin.note && (
                    <p className="mt-3 leading-7 text-slate-600">
                      {checkin.note}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex rounded-2xl bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]"
                      href={`/check-in?date=${checkin.date}`}
                    >
                      Koreksi absen
                    </Link>
                    <button
                      className="inline-flex rounded-2xl bg-[#FBE3E3] px-4 py-2 text-sm font-extrabold text-[#B75D5D] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deletingDate === checkin.date}
                      onClick={() => handleDeleteCheckin(checkin.date)}
                      type="button"
                    >
                      {deletingDate === checkin.date ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
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

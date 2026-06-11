"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Flame,
  Images,
  NotebookPen,
  PiggyBank,
  Sprout,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
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

const historyPageSize = 5;

export default function StatsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([loadProfile(), loadCheckins()]).then(
        ([nextProfile, nextCheckins]) => {
          setProfile(nextProfile);
          setCheckins(nextCheckins);
          loadLeaderboard(nextProfile, nextCheckins).then(setLeaderboard);
          setIsLoading(false);
        },
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = useMemo(
    () => calculateSummary(profile, checkins),
    [profile, checkins],
  );
  const insights = useMemo(() => getRelapseInsights(checkins), [checkins]);
  const sortedCheckins = useMemo(
    () => [...checkins].sort((a, b) => b.date.localeCompare(a.date)),
    [checkins],
  );
  const historyPageCount = Math.max(
    1,
    Math.ceil(sortedCheckins.length / historyPageSize),
  );
  const safeHistoryPage = Math.min(historyPage, historyPageCount);
  const recentCheckins = sortedCheckins.slice(
    (safeHistoryPage - 1) * historyPageSize,
    safeHistoryPage * historyPageSize,
  );
  const topLeaderboard = leaderboard.slice(0, 5);

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

  if (isLoading) {
    return (
      <AppShell>
        <StatsSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-6 text-white shadow-xl shadow-slate-300/70">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                Statistik
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Lihat pola tanpa merasa sedang dinilai.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                Statistik ini hanya kompas kecil: apa yang sudah berjalan, apa
                yang perlu dijaga, dan kapan kamu butuh bantuan.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-extrabold text-[#123B3F] shadow-lg shadow-black/10"
              href="/share"
            >
              <Images className="size-5" />
              Buat Kartu Perjalanan
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Sprout}
            label="Rentetan aktif"
            value={`${summary.currentStreak} hari`}
          />
          <StatCard
            icon={Trophy}
            label="Terpanjang"
            value={`${summary.longestStreak} hari`}
          />
          <StatCard
            icon={PiggyBank}
            label="Uang dihemat"
            value={formatRupiah(summary.savedMoney)}
          />
          <StatCard
            icon={Flame}
            label="Kambuh"
            value={`${summary.relapseDays} hari`}
          />
        </div>

        {checkins.length === 0 ? (
          <EmptyState
            actionHref="/check-in"
            actionLabel="Mulai absen"
            body="Statistik akan muncul setelah kamu mengisi check-in pertama. Satu catatan jujur sudah cukup untuk mulai."
            icon={NotebookPen}
            title="Belum ada statistik"
          />
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[0.92fr_0.72fr]">
              <section className="rounded-[2rem] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                      Peringkat aktif
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold">
                      Rentetan bebas rokok
                    </h2>
                    <p className="mt-2 leading-7 text-slate-600">
                      Hanya menampilkan peserta yang masih menjaga rentetan
                      bebas rokok aktif sampai hari ini.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
                    {leaderboard.length} aktif
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {topLeaderboard.length === 0 ? (
                    <EmptyState
                      actionHref="/check-in"
                      actionLabel="Absen bebas rokok"
                      body="Peringkat aktif muncul saat ada peserta yang absen bebas rokok hari ini dan menjaga rentetan beruntun."
                      icon={Trophy}
                      title="Peringkat siap dimulai"
                    />
                  ) : (
                    topLeaderboard.map((entry) => (
                      <div
                        className="grid gap-3 rounded-2xl bg-[#F6F8F7] p-4 sm:grid-cols-[52px_1fr_auto] sm:items-center"
                        key={`${entry.rank}-${entry.name}`}
                      >
                        <div className="grid size-12 place-items-center rounded-2xl bg-white text-lg font-extrabold text-[#2F7D57]">
                          #{entry.rank}
                        </div>
                        <div>
                          <p className="font-extrabold">{entry.name}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {entry.checkinCount}x absen total
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-left sm:text-right">
                          <p className="text-xs font-bold text-slate-500">
                            Rentetan
                          </p>
                          <p className="text-xl font-extrabold">
                            {entry.currentStreak} hari
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] bg-[#E3F3F7] p-5">
                <p className="text-sm font-extrabold uppercase text-[#36798D]">
                  Wawasan ringkas
                </p>
                <h2 className="mt-3 text-2xl font-extrabold">
                  {insights.relapseCount === 0
                    ? "Belum ada pola kambuh"
                    : "Ada pola yang bisa kamu siapkan"}
                </h2>
                <p className="mt-3 leading-7 text-slate-700">
                  {insights.relapseCount === 0
                    ? "Bagus kalau belum ada catatan kambuh. Kalau suatu hari berat, catat saja dengan aman agar polanya terbaca."
                    : `Pemicu yang sering muncul: ${insights.topTrigger?.name ?? "belum tercatat"}. Siapkan alternatif kecil sebelum momen itu datang.`}
                </p>
                {insights.topMood && (
                  <p className="mt-4 rounded-2xl bg-white/75 p-4 text-sm font-bold text-[#36798D]">
                    Perasaan yang sering muncul: {insights.topMood.name}
                  </p>
                )}
                <Link
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-extrabold text-[#123B3F] shadow-sm"
                  href="/journal"
                >
                  Tulis refleksi
                  <ArrowRight className="size-4" />
                </Link>
              </section>
            </div>

            <section className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                    Riwayat terbaru
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold">
                    5 absen terakhir
                  </h2>
                  <p className="mt-2 leading-7 text-slate-600">
                    Cukup ringkas di sini. Koreksi dan hapus tetap tersedia.
                  </p>
                </div>
                <Link
                  className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]"
                  href="/calendar"
                >
                  Kalender
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {recentCheckins.map((checkin) => (
                  <article
                    className="rounded-2xl border border-slate-100 bg-[#F6F8F7] p-4"
                    key={checkin.date}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-extrabold">{checkin.date}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {checkin.smokedCount} batang
                          {checkin.mood ? ` - Perasaan: ${checkin.mood}` : ""}
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
                        Koreksi
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
                ))}
              </div>

              {sortedCheckins.length > historyPageSize && (
                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-slate-500">
                    Halaman {safeHistoryPage} dari {historyPageCount}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeHistoryPage === 1}
                      onClick={() =>
                        setHistoryPage((current) => Math.max(1, current - 1))
                      }
                      type="button"
                    >
                      Sebelumnya
                    </button>
                    <button
                      className="rounded-2xl bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeHistoryPage === historyPageCount}
                      onClick={() =>
                        setHistoryPage((current) =>
                          Math.min(historyPageCount, current + 1),
                        )
                      }
                      type="button"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sprout;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
      <Icon className="size-6 text-[#4FAE7B]" />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="h-56 rounded-[2rem] bg-white skeleton-shimmer" />
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="h-32 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-32 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-32 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-32 rounded-[1.5rem] bg-white skeleton-shimmer" />
      </div>
      <div className="h-80 rounded-[2rem] bg-white skeleton-shimmer" />
    </section>
  );
}

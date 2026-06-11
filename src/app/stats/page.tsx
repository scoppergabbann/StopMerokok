"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { Flame, NotebookPen, Trophy } from "lucide-react";
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
  const sortedCheckins = [...checkins].sort((a, b) =>
    b.date.localeCompare(a.date),
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
          Statistik
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Statistik perkembangan</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Lihat pola sederhana dari absen yang sudah kamu isi.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Rentetan terpanjang</p>
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
                Papan peringkat
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Peringkat rentetan bebas rokok
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Peserta hanya masuk peringkat kalau masih absen bebas rokok
                beruntun sampai hari ini. Satu hari terlewat atau kambuh,
                otomatis gugur dari papan peringkat aktif.
              </p>
            </div>
            <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
              {leaderboard.length} aktif
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {leaderboard.length === 0 ? (
              <EmptyState
                actionHref="/check-in"
                actionLabel="Absen bebas rokok"
                body="Peringkat aktif baru muncul saat ada pengguna yang absen bebas rokok hari ini dan menjaga rentetan beruntun."
                icon={Trophy}
                secondaryHref="/community"
                secondaryLabel="Lihat komunitas"
                title="Papan peringkat siap dimulai"
              />
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
                      Rentetan bebas rokok aktif {entry.currentStreak} hari
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
                    <p className="text-xs font-bold text-slate-500">Rentetan</p>
                    <p className="text-xl font-extrabold">
                      {entry.currentStreak} hari
                    </p>
                    {entry.lastCheckin && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Terakhir: {entry.lastCheckin}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                Riwayat aktivitas
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Absen terbaru
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Data aktivitas sekarang tersedia di statistik. Kamu tetap bisa
                koreksi atau hapus absen yang sudah berlalu.
              </p>
            </div>
            <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
              {checkins.length} catatan
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {recentCheckins.length === 0 ? (
              <EmptyState
                actionHref="/check-in"
                actionLabel="Mulai absen"
                body="Setelah kamu absen, riwayatnya akan muncul di sini dan bisa dikoreksi atau dihapus kapan saja."
                icon={NotebookPen}
                title="Riwayat aktivitas masih kosong"
              />
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
        </div>

        <div className="mt-6 rounded-[2rem] bg-[#E3F3F7] p-5">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Wawasan kambuh
          </p>
          {insights.relapseCount === 0 ? (
            <div className="mt-4">
              <EmptyState
                actionHref="/craving"
                actionLabel="Buka bantuan dorongan merokok"
                body="Bagus kalau belum ada catatan kambuh. Kalau suatu hari berat, kamu tetap bisa mencatat dengan aman agar polanya terbaca."
                icon={Flame}
                secondaryHref="/journal"
                secondaryLabel="Tulis refleksi"
                title="Belum ada pola kambuh"
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/75 p-4">
                <p className="text-sm font-bold text-slate-500">
                  Pemicu paling sering
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  {insights.topTrigger?.name ?? "Belum tercatat"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {insights.topTrigger
                    ? `${insights.topTrigger.count} kali muncul saat kambuh.`
                    : "Isi pemicu saat absen kambuh."}
                </p>
              </div>
              <div className="rounded-2xl bg-white/75 p-4">
                <p className="text-sm font-bold text-slate-500">
                  Perasaan saat kambuh
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  {insights.topMood?.name ?? "Belum tercatat"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Coba siapkan alternatif kecil sebelum perasaan ini memuncak.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

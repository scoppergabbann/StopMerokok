"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import {
  loadCheckins,
  loadJournals,
  loadProfile,
  removeCheckin,
} from "@/lib/client-data";
import {
  statusLabels,
  statusStyles,
  type DailyCheckin,
  type JournalEntry,
  type Profile,
} from "@/lib/mvp-store";

export default function ActivityPage() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadCheckins().then((items) => setCheckins(items.reverse()));
      loadJournals().then(setJournals);
      loadProfile().then(setProfile);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

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
      setCheckins((items) => items.filter((item) => item.date !== date));
      showToast({
        message: "Data absen berhasil dihapus.",
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              Activity
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">Riwayat check-in</h1>
            <p className="mt-3 leading-7 text-slate-600">
              Setiap catatan adalah bahan belajar, bukan bahan menghakimi.
            </p>
          </div>
          <button
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700 shadow-sm"
            onClick={() => {
              downloadProgressCsv({ checkins, journals, profile });
              showToast({
                message: "File CSV progress pribadi sudah dibuat.",
                title: "Backup siap",
                variant: "success",
              });
            }}
            type="button"
          >
            Download CSV
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {checkins.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="font-bold text-slate-600">
                Belum ada riwayat. Coba absen hari ini dulu.
              </p>
            </div>
          ) : (
            checkins.map((checkin) => (
              <article
                className="rounded-[2rem] bg-white p-5 shadow-sm"
                key={checkin.date}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-extrabold">{checkin.date}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {checkin.smokedCount} batang
                      {checkin.mood ? ` • Mood: ${checkin.mood}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      statusStyles[checkin.status]
                    }`}
                  >
                    {statusLabels[checkin.status]}
                  </span>
                </div>
                  {checkin.note && (
                  <p className="mt-4 leading-7 text-slate-600">
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
      </section>
    </AppShell>
  );
}

function csvEscape(value: string | number | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadProgressCsv({
  checkins,
  journals,
  profile,
}: {
  checkins: DailyCheckin[];
  journals: JournalEntry[];
  profile: Profile | null;
}) {
  const journalByDate = new Map(journals.map((journal) => [journal.date, journal]));
  const rows = [
    [
      "nama",
      "baseline_per_hari",
      "tanggal",
      "status",
      "batang",
      "mood",
      "trigger",
      "catatan_checkin",
      "cerita_journal",
      "tantangan",
      "syukur",
      "fokus_besok",
    ],
    ...checkins.map((checkin) => {
      const journal = journalByDate.get(checkin.date);
      return [
        profile?.name ?? "",
        profile?.smokingBaselinePerDay ?? "",
        checkin.date,
        statusLabels[checkin.status],
        checkin.smokedCount,
        checkin.mood ?? "",
        checkin.trigger ?? "",
        checkin.note ?? "",
        journal?.story ?? "",
        journal?.challenge ?? "",
        journal?.gratitude ?? "",
        journal?.tomorrowFocus ?? "",
      ];
    }),
  ];
  const csv = rows
    .map((row) => row.map((cell) => csvEscape(cell)).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stopmerokok-progress-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

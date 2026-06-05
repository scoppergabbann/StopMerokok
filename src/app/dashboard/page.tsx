"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Flame,
  NotebookPen,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { NotificationOptIn } from "@/components/notification-opt-in";
import { useToast } from "@/components/toast-provider";
import {
  loadCheckins,
  loadCravingLogs,
  loadProfile,
  loadUserBadges,
  persistUnlockedBadges,
} from "@/lib/client-data";
import {
  calculateSummary,
  formatRupiah,
  getMonthDays,
  getPersonalizedInsight,
  getRelapseInsights,
  getUnlockedBadges,
  statusLabels,
  statusStyles,
  todayKey,
  targetLabels,
  type DailyCheckin,
  type Profile,
  type CravingLog,
  type UserBadge,
} from "@/lib/mvp-store";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [cravingLogs, setCravingLogs] = useState<CravingLog[]>([]);
  const [storedBadges, setStoredBadges] = useState<UserBadge[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProfile().then(setProfile);
      loadCheckins().then(setCheckins);
      loadCravingLogs().then(setCravingLogs);
      loadUserBadges().then(setStoredBadges);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const today = checkins.find((item) => item.date === todayKey()) ?? null;
  const summary = useMemo(
    () => calculateSummary(profile, checkins),
    [profile, checkins],
  );
  const badges = useMemo(
    () => getUnlockedBadges(summary, checkins, cravingLogs),
    [summary, checkins, cravingLogs],
  );
  const unlockedBadges = badges.filter((badge) => badge.isUnlocked);
  const relapseInsights = getRelapseInsights(checkins);
  const personalizedInsight = getPersonalizedInsight(checkins);
  const progress = Math.min(summary.smokeFreeDays, summary.targetDays);
  const currentMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const monthDays = useMemo(
    () => getMonthDays(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth],
  );
  const monthLabel = visibleMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const isCurrentMonth =
    visibleMonth.getFullYear() === currentMonth.getFullYear() &&
    visibleMonth.getMonth() === currentMonth.getMonth();
  const checkinsByDate = new Map(checkins.map((item) => [item.date, item]));

  function changeVisibleMonth(direction: -1 | 1) {
    setVisibleMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + direction, 1),
    );
  }

  function showCurrentMonth() {
    setVisibleMonth(currentMonth);
  }

  useEffect(() => {
    if (checkins.length === 0) {
      return;
    }

    const storedNames = new Set(storedBadges.map((badge) => badge.name));
    const hasNewBadge = badges.some(
      (badge) => badge.isUnlocked && !storedNames.has(badge.name),
    );

    if (!hasNewBadge) {
      return;
    }

    persistUnlockedBadges(badges).then((newBadges) => {
      if (newBadges.length === 0) {
        return;
      }

      setStoredBadges((current) => [...current, ...newBadges]);
      showToast({
        message:
          newBadges.length === 1
            ? `${newBadges[0].name} baru saja terbuka.`
            : `${newBadges.length} badge baru terbuka.`,
        title: "Badge baru",
        variant: "success",
      });
    });
  }, [badges, checkins.length, showToast, storedBadges]);

  return (
    <AppShell>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Halo, {profile?.name ?? "Teman"}. Gimana kabarmu hari ini?
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Tidak harus sempurna. Yang penting hari ini kamu tetap mencoba.
          </p>
        </div>

        {!profile && (
          <div className="rounded-[2rem] bg-[#FFF4CC] p-5">
            <p className="font-extrabold">Data awal belum lengkap.</p>
            <p className="mt-2 leading-7 text-slate-700">
              Isi onboarding dulu agar progress, savings, dan target bisa
              dihitung.
            </p>
            <Link
              className="mt-4 inline-flex rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
              href="/onboarding"
            >
              Isi onboarding
            </Link>
          </div>
        )}

        <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">
                Status hari ini
              </p>
              {today ? (
                <span
                  className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${
                    statusStyles[today.status]
                  }`}
                >
                  {statusLabels[today.status]}
                </span>
              ) : (
                <p className="mt-1 text-2xl font-extrabold">Belum absen</p>
              )}
            </div>
            <Link
              className="rounded-2xl bg-[#4FAE7B] px-5 py-3 text-center font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
              href="/check-in"
            >
              {today ? "Ubah absen hari ini" : "Absen Hari Ini"}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Current streak", `${summary.currentStreak} hari`],
            ["Hari bebas rokok", `${summary.smokeFreeDays} hari`],
            ["Uang dihemat", formatRupiah(summary.savedMoney)],
            ["Batang dihindari", `${summary.avoidedSticks} batang`],
          ].map(([label, value]) => (
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm" key={label}>
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  Progress target
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  {progress} dari {summary.targetDays} hari
                </p>
              </div>
              <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
                {profile ? targetLabels[profile.targetType] : "30 hari"}
              </span>
            </div>
            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#4FAE7B]"
                style={{
                  width: `${Math.min(100, (progress / summary.targetDays) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
            <p className="text-sm font-extrabold text-[#36798D]">
              Motivasi hari ini
            </p>
            <p className="mt-3 text-lg font-bold leading-8">
              Kamu tidak sedang kehilangan rokok. Kamu sedang mengambil kembali
              kendali.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">
                Kalender progress
              </p>
              <h2 className="mt-1 text-xl font-extrabold capitalize">
                {isCurrentMonth ? "Bulan ini" : monthLabel}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Bulan sebelumnya"
                className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                onClick={() => changeVisibleMonth(-1)}
                type="button"
              >
                <ChevronLeft className="size-5" />
              </button>
              {!isCurrentMonth && (
                <button
                  className="rounded-full bg-[#E3F3F7] px-3 py-2 text-xs font-extrabold text-[#36798D]"
                  onClick={showCurrentMonth}
                  type="button"
                >
                  Bulan ini
                </button>
              )}
              <button
                aria-label="Bulan berikutnya"
                className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isCurrentMonth}
                onClick={() => changeVisibleMonth(1)}
                type="button"
              >
                <ChevronRight className="size-5" />
              </button>
              <Link
                className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]"
                href="/calendar"
              >
                Detail
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const checkin = checkinsByDate.get(day);
              const className = checkin
                ? statusStyles[checkin.status]
                : "bg-slate-100 text-slate-400";

              return (
                <Link
                  className={`grid aspect-square place-items-center rounded-2xl text-xs font-extrabold ${className}`}
                  href="/calendar"
                  key={day}
                  title={day}
                >
                  {Number(day.slice(-2))}
                </Link>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 sm:grid-cols-4">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#DFF3E8]" />
              Bebas rokok
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#FFF4CC]" />
              Mengurangi
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#FBE3E3]" />
              Kambuh
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-slate-100" />
              Belum absen
            </span>
          </div>
        </div>

        <Link
          className="flex flex-col gap-4 rounded-[2rem] bg-[#1F2933] p-5 text-white shadow-xl shadow-slate-300/60 sm:flex-row sm:items-center sm:justify-between"
          href="/craving"
        >
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#9DE5BD]">
              <Flame className="size-6" />
            </span>
            <div>
              <p className="text-xl font-extrabold">
                Saya Lagi Ingin Merokok
              </p>
              <p className="mt-1 leading-7 text-slate-300">
                Tahan 5 menit dulu. Kita lewati momen ini pelan-pelan.
              </p>
            </div>
          </div>
          <span className="rounded-2xl bg-[#4FAE7B] px-5 py-3 text-center font-extrabold">
            Buka bantuan
          </span>
        </Link>

        <NotificationOptIn />

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-0.5"
            href="/motivation"
          >
            <BookOpenText className="size-7 text-[#36798D]" />
            <h2 className="mt-4 text-xl font-extrabold">Motivasi pendek</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Tips craving, quote harian, dan reminder alasan berhenti.
            </p>
          </Link>
          <Link
            className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-0.5"
            href="/journal"
          >
            <NotebookPen className="size-7 text-[#4FAE7B]" />
            <h2 className="mt-4 text-xl font-extrabold">Journal harian</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Tulis cerita, tantangan, syukur, dan fokus untuk besok.
            </p>
          </Link>
        </div>

        <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Insight personal
          </p>
          <p className="mt-3 text-lg font-bold leading-8">
            {personalizedInsight.title}
          </p>
          <p className="mt-3 leading-7 text-slate-700">
            {personalizedInsight.action}
          </p>
          {relapseInsights.topMood && (
            <p className="mt-3 text-sm font-bold text-[#36798D]">
              Mood yang sering muncul saat kambuh:{" "}
              {relapseInsights.topMood.name}
            </p>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy className="size-7 text-[#4FAE7B]" />
            <div>
              <h2 className="text-xl font-extrabold">Badge perjalanan</h2>
              <p className="text-sm font-semibold text-slate-500">
                {unlockedBadges.length} dari {badges.length} badge terbuka
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div
                className={`rounded-2xl border p-4 ${
                  badge.isUnlocked
                    ? "border-[#DFF3E8] bg-[#DFF3E8]"
                    : "border-slate-100 bg-slate-50 text-slate-400"
                }`}
                key={badge.name}
              >
                <p className="font-extrabold">{badge.name}</p>
                <p className="mt-1 text-sm font-medium leading-6">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

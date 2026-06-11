"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Flame,
  NotebookPen,
  Target,
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
  getCalendarMonthDays,
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

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getDailyFocus(
  today: DailyCheckin | null,
  summary: ReturnType<typeof calculateSummary>,
  relapseInsights: ReturnType<typeof getRelapseInsights>,
) {
  if (!today) {
    return {
      actionHref: "/check-in",
      actionLabel: "Absen sekarang",
      detail:
        "Isi absen sebelum malam agar rentetan dan kalender kamu tetap utuh.",
      label: "Belum absen",
      title: "Selesaikan satu langkah kecil hari ini",
    };
  }

  if (today.status === "smoke_free") {
    const nextTarget =
      summary.currentStreak < 7
        ? 7
        : summary.currentStreak < 30
          ? 30
          : summary.currentStreak < 90
            ? 90
            : 180;
    return {
      actionHref: "/community",
      actionLabel: "Lihat komunitas",
      detail: `${Math.max(nextTarget - summary.currentStreak, 0)} hari lagi menuju target ${nextTarget} hari. Jaga ritme yang sudah kamu bangun hari ini.`,
      label: "Bebas rokok",
      title: "Pertahankan napas lega ini sampai besok",
    };
  }

  if (today.status === "reduced") {
    return {
      actionHref: "/craving",
      actionLabel: "Buka bantuan dorongan",
      detail:
        "Mengurangi tetap progres. Coba tunda rokok berikutnya 10 menit dan ganti dengan air putih atau napas pelan.",
      label: "Mengurangi",
      title: "Fokus pada satu rokok yang bisa ditunda",
    };
  }

  return {
    actionHref: "/journal",
    actionLabel: "Tulis refleksi",
    detail: relapseInsights.topTrigger
      ? `Trigger yang sering muncul: ${relapseInsights.topTrigger.name}. Catat apa yang terjadi supaya besok kamu punya rencana yang lebih lembut.`
      : "Hari ini mungkin berat. Catat sebentar apa yang terjadi, lalu mulai lagi dari langkah yang paling kecil.",
    label: "Mulai lagi",
    title: "Kambuh bukan akhir perjalanan",
  };
}

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
  const dailyFocus = getDailyFocus(today, summary, relapseInsights);
  const progress = Math.min(summary.smokeFreeDays, summary.targetDays);
  const currentMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const monthDays = useMemo(
    () =>
      getCalendarMonthDays(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
      ),
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
            : `${newBadges.length} lencana baru terbuka.`,
        title: "Lencana baru",
        variant: "success",
      });
    });
  }, [badges, checkins.length, showToast, storedBadges]);

  return (
    <AppShell>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Beranda
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
              Isi data awal dulu agar progres, penghematan, dan target bisa
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
            ["Rentetan aktif", `${summary.currentStreak} hari`],
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

        <div className="rounded-[2rem] border border-[#DFF3E8] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
                <Target className="size-6" />
              </span>
              <div>
                <span className="inline-flex rounded-full bg-[#E3F3F7] px-3 py-1 text-xs font-extrabold text-[#36798D]">
                  {dailyFocus.label}
                </span>
                <h2 className="mt-3 text-2xl font-extrabold">
                  Fokus hari ini
                </h2>
                <p className="mt-1 text-lg font-bold leading-8">
                  {dailyFocus.title}
                </p>
                <p className="mt-2 leading-7 text-slate-600">
                  {dailyFocus.detail}
                </p>
              </div>
            </div>
            <Link
              className="rounded-2xl bg-[#1F2933] px-5 py-3 text-center font-extrabold text-white shadow-lg shadow-slate-300/60 transition hover:bg-[#111827]"
              href={dailyFocus.actionHref}
            >
              {dailyFocus.actionLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">
                Kemajuan target
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
                Kalender progres
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
            {weekdayLabels.map((day) => (
              <div
                className="grid h-8 place-items-center text-xs font-extrabold text-slate-500"
                key={day}
              >
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const checkin = checkinsByDate.get(day.date);
              const className = !day.isCurrentMonth
                ? "bg-white text-slate-300"
                : checkin
                  ? statusStyles[checkin.status]
                  : "bg-slate-100 text-slate-400";

              return (
                <Link
                  className={`grid aspect-square place-items-center rounded-2xl text-xs font-extrabold ${className}`}
                  href="/calendar"
                  key={day.date}
                  title={day.date}
                >
                  {Number(day.date.slice(-2))}
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
              Tips dorongan merokok, kutipan harian, dan pengingat alasan berhenti.
            </p>
          </Link>
          <Link
            className="rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-0.5"
            href="/journal"
          >
            <NotebookPen className="size-7 text-[#4FAE7B]" />
            <h2 className="mt-4 text-xl font-extrabold">Jurnal harian</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Tulis cerita, tantangan, syukur, dan fokus untuk besok.
            </p>
          </Link>
        </div>

        <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Wawasan personal
          </p>
          <p className="mt-3 text-lg font-bold leading-8">
            {personalizedInsight.title}
          </p>
          <p className="mt-3 leading-7 text-slate-700">
            {personalizedInsight.action}
          </p>
          {relapseInsights.topMood && (
            <p className="mt-3 text-sm font-bold text-[#36798D]">
              Perasaan yang sering muncul saat kambuh:{" "}
              {relapseInsights.topMood.name}
            </p>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy className="size-7 text-[#4FAE7B]" />
            <div>
              <h2 className="text-xl font-extrabold">Lencana perjalanan</h2>
              <p className="text-sm font-semibold text-slate-500">
                {unlockedBadges.length} dari {badges.length} lencana terbuka
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

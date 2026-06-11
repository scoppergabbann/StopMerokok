"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpenText,
  CalendarCheck2,
  Flame,
  HeartHandshake,
  NotebookPen,
  Sparkles,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
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
  formatDateKey,
  formatRupiah,
  getPersonalizedInsight,
  getRelapseInsights,
  getUnlockedBadges,
  statusLabels,
  todayKey,
  type CravingLog,
  type DailyCheckin,
  type Profile,
  type UserBadge,
} from "@/lib/mvp-store";

const statusCopy = {
  relapsed: {
    body: "Hari ini mungkin berat. Kamu tetap boleh mulai lagi dari langkah kecil.",
    label: "Kamu tetap hadir",
  },
  reduced: {
    body: "Mengurangi tetap progress. Coba jaga satu keputusan kecil lagi hari ini.",
    label: "Progress berjalan",
  },
  smoke_free: {
    body: "Satu hari lagi tercatat. Jaga ritme ini sampai malam nanti.",
    label: "Bebas rokok hari ini",
  },
};

const shortcuts = [
  { href: "/stats", icon: BarChart3, label: "Statistik" },
  { href: "/community", icon: HeartHandshake, label: "Komunitas" },
  { href: "/journal", icon: NotebookPen, label: "Jurnal" },
  { href: "/profile", icon: Trophy, label: "Lencana" },
];

function getLastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

function getCheckinTone(checkin?: DailyCheckin) {
  if (!checkin) {
    return "bg-slate-100 text-slate-400";
  }

  if (checkin.status === "smoke_free") {
    return "bg-[#DFF3E8] text-[#2F7D57]";
  }

  if (checkin.status === "reduced") {
    return "bg-[#FFF4CC] text-[#9B6B00]";
  }

  return "bg-[#FBE3E3] text-[#B75D5D]";
}

function getDailyFocus(today: DailyCheckin | null) {
  if (!today) {
    return {
      actionLabel: "Absen Hari Ini",
      body: "Catat kondisi hari ini dulu. Cukup jujur, tidak harus sempurna.",
      href: "/check-in",
      label: "Belum absen",
      title: "Satu langkah kecil hari ini",
    };
  }

  return {
    actionLabel: "Ubah absen",
    body: statusCopy[today.status].body,
    href: "/check-in",
    label: statusLabels[today.status],
    title: statusCopy[today.status].label,
  };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [cravingLogs, setCravingLogs] = useState<CravingLog[]>([]);
  const [storedBadges, setStoredBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([
        loadProfile(),
        loadCheckins(),
        loadCravingLogs(),
        loadUserBadges(),
      ]).then(([nextProfile, nextCheckins, nextCravingLogs, nextBadges]) => {
        setProfile(nextProfile);
        setCheckins(nextCheckins);
        setCravingLogs(nextCravingLogs);
        setStoredBadges(nextBadges);
        setIsLoading(false);
      });
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
  const personalizedInsight = getPersonalizedInsight(checkins);
  const relapseInsights = getRelapseInsights(checkins);
  const dailyFocus = getDailyFocus(today);
  const checkinsByDate = new Map(checkins.map((item) => [item.date, item]));
  const lastSevenDays = useMemo(() => getLastSevenDays(), []);

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

  if (isLoading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Isi data awal"
          body="Lengkapi profil dasar dulu agar dashboard bisa menghitung progress, penghematan, dan targetmu."
          icon={CalendarCheck2}
          title="Dashboard belum siap"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Beranda
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Halo, {profile.name}. Hari ini mulai dari satu keputusan kecil.
          </h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            Fokus dulu ke kondisi hari ini. Fitur lain tetap ada, tapi tidak
            perlu semuanya kamu pikirkan sekarang.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-5 text-white shadow-xl shadow-slate-300/70 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-[#B8F1CE]">
                {dailyFocus.label}
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                {dailyFocus.title}
              </h2>
              <p className="mt-3 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                {dailyFocus.body}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-extrabold text-[#123B3F] shadow-lg shadow-black/10"
              href={dailyFocus.href}
            >
              <CalendarCheck2 className="size-5" />
              {dailyFocus.actionLabel}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Rentetan aktif" value={`${summary.currentStreak} hari`} />
          <MetricCard label="Uang dihemat" value={formatRupiah(summary.savedMoney)} />
          <MetricCard
            label="Batang dihindari"
            value={`${Math.round(summary.avoidedSticks)} batang`}
          />
        </div>

        <Link
          className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
          href="/craving"
        >
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF4CC] text-[#9B6B00]">
              <Flame className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold">Lagi ingin merokok?</h2>
              <p className="mt-1 leading-7 text-slate-600">
                Tahan 5 menit dulu. Buka bantuan napas, timer, dan langkah kecil
                untuk melewati dorongan.
              </p>
            </div>
          </div>
          <span className="rounded-2xl bg-[#1F2933] px-5 py-3 text-center font-extrabold text-white">
            Buka bantuan
          </span>
        </Link>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#36798D]">
                7 hari terakhir
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">Progress ringkas</h2>
            </div>
            <Link
              className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]"
              href="/stats"
            >
              Detail
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {lastSevenDays.map((date) => {
              const key = formatDateKey(date);
              const checkin = checkinsByDate.get(key);
              const dayLabel = date.toLocaleDateString("id-ID", {
                weekday: "short",
              });

              return (
                <div className="text-center" key={key}>
                  <div
                    className={`grid aspect-square place-items-center rounded-2xl text-sm font-extrabold ${getCheckinTone(checkin)}`}
                    title={key}
                  >
                    {date.getDate()}
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-slate-400">
                    {dayLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/70 text-[#36798D]">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="text-sm font-extrabold uppercase text-[#36798D]">
                Insight hari ini
              </p>
              <h2 className="mt-2 text-xl font-extrabold">
                {checkins.length === 0
                  ? "Mulai dari satu check-in jujur"
                  : personalizedInsight.title}
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                {checkins.length === 0
                  ? "Data kecil hari ini nanti jadi kompas perjalananmu."
                  : personalizedInsight.action}
              </p>
              {relapseInsights.topMood && (
                <p className="mt-3 text-sm font-bold text-[#36798D]">
                  Pola yang sering muncul: {relapseInsights.topMood.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            const value =
              shortcut.href === "/profile"
                ? `${unlockedBadges.length} lencana`
                : shortcut.label;

            return (
              <Link
                className="rounded-[1.5rem] bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
                href={shortcut.href}
                key={shortcut.href}
              >
                <Icon className="size-6 text-[#4FAE7B]" />
                <p className="mt-3 font-extrabold">{shortcut.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {value}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="rounded-[2rem] border border-dashed border-[#BFE7D1] bg-[#F7FBF9] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-extrabold">Butuh ruang menulis?</p>
              <p className="mt-1 leading-7 text-slate-600">
                Jurnal harian dipindahkan supaya dashboard tetap ringan.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-extrabold text-[#1F2933] shadow-sm"
              href="/journal"
            >
              <BookOpenText className="size-4" />
              Buka jurnal
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="h-28 rounded-[2rem] bg-white skeleton-shimmer" />
      <div className="h-56 rounded-[2rem] bg-white skeleton-shimmer" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
      </div>
      <div className="h-40 rounded-[2rem] bg-white skeleton-shimmer" />
    </section>
  );
}

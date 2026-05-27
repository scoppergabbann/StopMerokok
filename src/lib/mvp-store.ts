export type TargetType =
  | "quit_total"
  | "reduce_slowly"
  | "seven_days"
  | "thirty_days";

export type CheckinStatus = "smoke_free" | "reduced" | "relapsed";

export type Mood =
  | "Tenang"
  | "Stres"
  | "Senang"
  | "Capek"
  | "Sedih"
  | "Semangat";

export type Profile = {
  name: string;
  smokingBaselinePerDay: number;
  packPrice: number;
  sticksPerPack: number;
  targetType: TargetType;
  reasons: string[];
  createdAt: string;
};

export type DailyCheckin = {
  date: string;
  status: CheckinStatus;
  smokedCount: number;
  mood?: Mood;
  trigger?: string;
  note?: string;
  createdAt: string;
};

export type CravingLog = {
  createdAt: string;
  date: string;
  note?: string;
  status: "passed" | "smoked";
};

export type Summary = {
  currentStreak: number;
  longestStreak: number;
  smokeFreeDays: number;
  reducedDays: number;
  relapseDays: number;
  avoidedSticks: number;
  savedMoney: number;
  targetDays: number;
};

export type Badge = {
  description: string;
  isUnlocked: boolean;
  name: string;
};

export type Reward = {
  createdAt: string;
  targetAmount: number;
  title: string;
};

const PROFILE_KEY = "stopmerokok.profile";
const CHECKINS_KEY = "stopmerokok.checkins";
const REWARD_KEY = "stopmerokok.reward";
const CRAVING_LOGS_KEY = "stopmerokok.cravingLogs";

export const targetLabels: Record<TargetType, string> = {
  quit_total: "Berhenti total",
  reduce_slowly: "Mengurangi perlahan",
  seven_days: "Coba 7 hari tanpa rokok",
  thirty_days: "Coba 30 hari tanpa rokok",
};

export const statusLabels: Record<CheckinStatus, string> = {
  smoke_free: "Bebas Rokok",
  reduced: "Mengurangi",
  relapsed: "Kambuh",
};

export const statusStyles: Record<CheckinStatus, string> = {
  smoke_free: "bg-[#DFF3E8] text-[#2F7D57]",
  reduced: "bg-[#FFF4CC] text-[#9B6B00]",
  relapsed: "bg-[#FBE3E3] text-[#B75D5D]",
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function readProfile(): Profile | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export function saveProfile(profile: Profile) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function readCheckins(): DailyCheckin[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(CHECKINS_KEY);
  return raw ? (JSON.parse(raw) as DailyCheckin[]) : [];
}

export function readCravingLogs(): CravingLog[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(CRAVING_LOGS_KEY);
  return raw ? (JSON.parse(raw) as CravingLog[]) : [];
}

export function saveCravingLog(log: CravingLog) {
  if (!canUseStorage()) {
    return;
  }

  const logs = readCravingLogs();
  window.localStorage.setItem(
    CRAVING_LOGS_KEY,
    JSON.stringify([...logs, log]),
  );
}

export function saveCheckin(checkin: DailyCheckin) {
  if (!canUseStorage()) {
    return;
  }

  const checkins = readCheckins();
  const next = [
    ...checkins.filter((item) => item.date !== checkin.date),
    checkin,
  ].sort((a, b) => a.date.localeCompare(b.date));

  window.localStorage.setItem(CHECKINS_KEY, JSON.stringify(next));
}

export function readReward(): Reward | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(REWARD_KEY);
  return raw ? (JSON.parse(raw) as Reward) : null;
}

export function saveReward(reward: Reward) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REWARD_KEY, JSON.stringify(reward));
}

export function getTodayCheckin() {
  return readCheckins().find((item) => item.date === todayKey()) ?? null;
}

export function getTargetDays(targetType: TargetType) {
  if (targetType === "seven_days") {
    return 7;
  }

  if (targetType === "thirty_days") {
    return 30;
  }

  return 30;
}

export function calculateSummary(
  profile: Profile | null,
  checkins: DailyCheckin[],
): Summary {
  const baseline = profile?.smokingBaselinePerDay ?? 0;
  const pricePerStick =
    profile && profile.sticksPerPack > 0
      ? profile.packPrice / profile.sticksPerPack
      : 0;

  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let smokeFreeDays = 0;
  let reducedDays = 0;
  let relapseDays = 0;
  let avoidedSticks = 0;

  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date));

  for (const checkin of sorted) {
    if (checkin.status === "smoke_free") {
      smokeFreeDays += 1;
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }

    if (checkin.status === "reduced") {
      reducedDays += 1;
    }

    if (checkin.status === "relapsed") {
      relapseDays += 1;
    }

    avoidedSticks += Math.max(0, baseline - checkin.smokedCount);
  }

  currentStreak = runningStreak;

  return {
    currentStreak,
    longestStreak,
    smokeFreeDays,
    reducedDays,
    relapseDays,
    avoidedSticks,
    savedMoney: avoidedSticks * pricePerStick,
    targetDays: getTargetDays(profile?.targetType ?? "thirty_days"),
  };
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function parseRupiahInput(value: string) {
  return Number(value.replace(/\D/g, ""));
}

export function formatRupiahInput(value: string) {
  const number = parseRupiahInput(value);

  if (!number) {
    return "";
  }

  return `Rp${new Intl.NumberFormat("id-ID").format(number)}`;
}

export function feedbackForStatus(status: CheckinStatus) {
  if (status === "smoke_free") {
    return "Keren. Hari ini kamu menang satu langkah lagi.";
  }

  if (status === "reduced") {
    return "Bagus. Mengurangi tetap progress. Besok kita coba lebih baik lagi.";
  }

  return "Tidak apa-apa. Kambuh bukan akhir. Yang penting kamu sadar dan mau mulai lagi.";
}

export function getUnlockedBadges(
  summary: Summary,
  checkins: DailyCheckin[],
  cravingLogs: CravingLog[] = [],
) {
  const hasRelapseRecovery = checkins.some(
    (checkin, index) =>
      checkin.status === "smoke_free" &&
      checkins[index - 1]?.status === "relapsed",
  );

  const badges: Badge[] = [
    {
      description: "Kamu sudah mulai mencatat perjalananmu.",
      isUnlocked: checkins.length >= 1,
      name: "Hari Pertama",
    },
    {
      description: "Tiga hari bebas rokok bukan hal kecil.",
      isUnlocked: summary.longestStreak >= 3,
      name: "3 Hari Bertahan",
    },
    {
      description: "Satu minggu penuh untuk napas yang lebih lega.",
      isUnlocked: summary.longestStreak >= 7,
      name: "7 Hari Bebas Rokok",
    },
    {
      description: "Penghematan pertama yang mulai terasa.",
      isUnlocked: summary.savedMoney >= 50000,
      name: "Hemat Rp50.000",
    },
    {
      description: "Kamu berhasil menghindari 50 batang.",
      isUnlocked: summary.avoidedSticks >= 50,
      name: "Mengurangi 50 Batang",
    },
    {
      description: "Kambuh pernah terjadi, tapi kamu tetap kembali.",
      isUnlocked: hasRelapseRecovery,
      name: "Bangkit Lagi",
    },
    {
      description: "Kamu berhasil melewati satu momen craving.",
      isUnlocked: cravingLogs.some((log) => log.status === "passed"),
      name: "Lewati Craving",
    },
  ];

  return badges;
}

export function getMonthDays(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days: string[] = [];

  while (date.getMonth() === month) {
    days.push(date.toISOString().slice(0, 10));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

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
  age?: number;
  cigaretteBrand?: string;
  name: string;
  smokingBaselinePerDay: number;
  smokingStartedAge?: number;
  smokingStartedYear?: number;
  packPrice: number;
  sticksPerPack: number;
  targetType: TargetType;
  todaySmokedCount?: number;
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

export type JournalEntry = {
  challenge?: string;
  createdAt: string;
  date: string;
  gratitude?: string;
  mood?: Mood;
  story?: string;
  tomorrowFocus?: string;
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

export type UserBadge = {
  description: string;
  name: string;
  unlockedAt: string;
};

export type Reward = {
  createdAt: string;
  category?: string;
  id: string;
  targetAmount: number;
  title: string;
};

export type DonationAllocation = {
  amount: number;
  createdAt: string;
  id: string;
  note?: string;
  rewardId: string;
  title: string;
};

export type LeaderboardEntry = {
  activeBadge?: string;
  checkinCount: number;
  consistencyScore: number;
  currentStreak: number;
  lastCheckin?: string;
  name: string;
  rank: number;
  reducedDays: number;
  relapseDays: number;
  smokeFreeDays: number;
};

export type NotificationSettings = {
  enabled: boolean;
  lastNotifiedDate?: string;
  reminderHour: number;
};

export type CalendarMonthDay = {
  date: string;
  isCurrentMonth: boolean;
};

export type CommunityPost = {
  authorName: string;
  badge?: string;
  createdAt: string;
  id: string;
  message: string;
  streakAtPost: number;
  supportCount: number;
};

const PROFILE_KEY = "stopmerokok.profile";
const CHECKINS_KEY = "stopmerokok.checkins";
const REWARD_KEY = "stopmerokok.reward";
const REWARDS_KEY = "stopmerokok.rewards";
const DONATION_ALLOCATIONS_KEY = "stopmerokok.donationAllocations";
const CRAVING_LOGS_KEY = "stopmerokok.cravingLogs";
const NOTIFICATION_SETTINGS_KEY = "stopmerokok.notificationSettings";
const JOURNALS_KEY = "stopmerokok.journals";
const USER_BADGES_KEY = "stopmerokok.userBadges";
const COMMUNITY_POSTS_KEY = "stopmerokok.communityPosts";

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
  return formatDateKey(new Date());
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

export function readJournals(): JournalEntry[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(JOURNALS_KEY);
  return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
}

export function saveJournal(entry: JournalEntry) {
  if (!canUseStorage()) {
    return;
  }

  const journals = readJournals();
  const next = [
    ...journals.filter((journal) => journal.date !== entry.date),
    entry,
  ].sort((a, b) => a.date.localeCompare(b.date));

  window.localStorage.setItem(JOURNALS_KEY, JSON.stringify(next));
}

export function getTodayJournal() {
  return readJournals().find((journal) => journal.date === todayKey()) ?? null;
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

export function deleteCheckin(date: string) {
  if (!canUseStorage()) {
    return;
  }

  const next = readCheckins().filter((item) => item.date !== date);
  window.localStorage.setItem(CHECKINS_KEY, JSON.stringify(next));
}

export function readReward(): Reward | null {
  if (!canUseStorage()) {
    return null;
  }

  const rewards = readRewards();
  if (rewards.length > 0) {
    return rewards[0];
  }

  const raw = window.localStorage.getItem(REWARD_KEY);
  const reward = raw ? (JSON.parse(raw) as Omit<Reward, "id">) : null;
  return reward
    ? {
        ...reward,
        id: crypto.randomUUID(),
      }
    : null;
}

export function readRewards(): Reward[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(REWARDS_KEY);
  const rewards = raw ? (JSON.parse(raw) as Reward[]) : [];

  if (rewards.length > 0) {
    return rewards;
  }

  const legacyReward = window.localStorage.getItem(REWARD_KEY);
  return legacyReward
    ? [
        {
          ...(JSON.parse(legacyReward) as Omit<Reward, "id">),
          id: crypto.randomUUID(),
        },
      ]
    : [];
}

export function saveReward(reward: Reward) {
  if (!canUseStorage()) {
    return;
  }

  const rewards = readRewards();
  const next = [
    reward,
    ...rewards.filter((item) => item.id !== reward.id),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  window.localStorage.setItem(REWARDS_KEY, JSON.stringify(next));
}

export function readDonationAllocations(): DonationAllocation[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(DONATION_ALLOCATIONS_KEY);
  return raw ? (JSON.parse(raw) as DonationAllocation[]) : [];
}

export function saveDonationAllocation(allocation: DonationAllocation) {
  if (!canUseStorage()) {
    return;
  }

  const allocations = readDonationAllocations();
  const next = [allocation, ...allocations].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  window.localStorage.setItem(DONATION_ALLOCATIONS_KEY, JSON.stringify(next));
}

export function readNotificationSettings(): NotificationSettings {
  if (!canUseStorage()) {
    return {
      enabled: false,
      reminderHour: 20,
    };
  }

  const raw = window.localStorage.getItem(NOTIFICATION_SETTINGS_KEY);

  return raw
    ? (JSON.parse(raw) as NotificationSettings)
    : {
        enabled: false,
        reminderHour: 20,
      };
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    NOTIFICATION_SETTINGS_KEY,
    JSON.stringify(settings),
  );
}

export function readUserBadges(): UserBadge[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(USER_BADGES_KEY);
  return raw ? (JSON.parse(raw) as UserBadge[]) : [];
}

export function saveUserBadges(badges: UserBadge[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USER_BADGES_KEY, JSON.stringify(badges));
}

export function unlockUserBadges(badges: Badge[]) {
  const storedBadges = readUserBadges();
  const storedNames = new Set(storedBadges.map((badge) => badge.name));
  const newlyUnlocked = badges
    .filter((badge) => badge.isUnlocked && !storedNames.has(badge.name))
    .map((badge) => ({
      description: badge.description,
      name: badge.name,
      unlockedAt: new Date().toISOString(),
    }));

  if (newlyUnlocked.length > 0) {
    saveUserBadges([...storedBadges, ...newlyUnlocked]);
  }

  return newlyUnlocked;
}

export function readCommunityPosts(): CommunityPost[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(COMMUNITY_POSTS_KEY);
  return raw ? (JSON.parse(raw) as CommunityPost[]) : [];
}

export function saveCommunityPost(post: CommunityPost) {
  if (!canUseStorage()) {
    return;
  }

  const posts = readCommunityPosts();
  const next = [post, ...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  window.localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(next));
}

export function supportCommunityPost(postId: string) {
  if (!canUseStorage()) {
    return;
  }

  const posts = readCommunityPosts();
  const next = posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          supportCount: post.supportCount + 1,
        }
      : post,
  );

  window.localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(next));
}

export function hasCheckedInToday() {
  return readCheckins().some((checkin) => checkin.date === todayKey());
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

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function getCurrentSmokeFreeStreak(checkins: DailyCheckin[]) {
  const byDate = new Map(checkins.map((checkin) => [checkin.date, checkin]));
  let date = todayKey();
  let streak = 0;

  while (byDate.get(date)?.status === "smoke_free") {
    streak += 1;
    date = addDays(date, -1);
  }

  return streak;
}

export function getStreakBadge(streak: number) {
  if (streak >= 365) {
    return "Legenda 1 Tahun";
  }

  if (streak >= 180) {
    return "6 Bulan Konsisten";
  }

  if (streak >= 90) {
    return "3 Bulan Bertahan";
  }

  if (streak >= 30) {
    return "30 Hari Bebas Rokok";
  }

  if (streak >= 7) {
    return "1 Minggu Tanpa Rokok";
  }

  return undefined;
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
      description: "Satu minggu penuh tanpa rokok. Ini badge spesial pertamamu.",
      isUnlocked: summary.longestStreak >= 7,
      name: "1 Minggu Tanpa Rokok",
    },
    {
      description: "Tiga puluh hari membangun ulang ritme tubuh dan pikiran.",
      isUnlocked: summary.longestStreak >= 30,
      name: "30 Hari Bebas Rokok",
    },
    {
      description: "Tiga bulan bertahan adalah bukti sistemmu mulai kuat.",
      isUnlocked: summary.longestStreak >= 90,
      name: "3 Bulan Bertahan",
    },
    {
      description: "Enam bulan menjaga komitmen. Napas baru makin nyata.",
      isUnlocked: summary.longestStreak >= 180,
      name: "6 Bulan Konsisten",
    },
    {
      description: "Satu tahun bebas rokok. Ini pencapaian besar.",
      isUnlocked: summary.longestStreak >= 365,
      name: "Legenda 1 Tahun",
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
    days.push(formatDateKey(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

export function getMonthStartOffset(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function getCalendarMonthDays(
  year: number,
  month: number,
): CalendarMonthDay[] {
  const currentMonthDays = getMonthDays(year, month).map((date) => ({
    date,
    isCurrentMonth: true,
  }));
  const startOffset = getMonthStartOffset(year, month);
  const previousMonthDays =
    startOffset === 0
      ? []
      : getMonthDays(year, month - 1)
          .slice(-startOffset)
          .map((date) => ({
            date,
            isCurrentMonth: false,
          }));
  const totalVisibleDays = previousMonthDays.length + currentMonthDays.length;
  const nextMonthDayCount =
    totalVisibleDays % 7 === 0 ? 0 : 7 - (totalVisibleDays % 7);
  const nextMonthDays = getMonthDays(year, month + 1)
    .slice(0, nextMonthDayCount)
    .map((date) => ({
      date,
      isCurrentMonth: false,
    }));

  return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
}

export function getRelapseInsights(checkins: DailyCheckin[]) {
  const relapses = checkins.filter((checkin) => checkin.status === "relapsed");
  const triggerCounts = new Map<string, number>();
  const moodCounts = new Map<string, number>();

  for (const relapse of relapses) {
    if (relapse.trigger) {
      triggerCounts.set(
        relapse.trigger,
        (triggerCounts.get(relapse.trigger) ?? 0) + 1,
      );
    }

    if (relapse.mood) {
      moodCounts.set(relapse.mood, (moodCounts.get(relapse.mood) ?? 0) + 1);
    }
  }

  const topTrigger = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    relapseCount: relapses.length,
    topMood: topMood
      ? {
          count: topMood[1],
          name: topMood[0],
        }
      : null,
    topTrigger: topTrigger
      ? {
          count: topTrigger[1],
          name: topTrigger[0],
        }
      : null,
  };
}

export function getPersonalizedInsight(checkins: DailyCheckin[]) {
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 7);
  const recentRelapses = recent.filter(
    (checkin) => checkin.status === "relapsed",
  );
  const recentReduced = recent.filter((checkin) => checkin.status === "reduced");
  const recentSmokeFree = recent.filter(
    (checkin) => checkin.status === "smoke_free",
  );
  const lastThree = sorted.slice(0, 3);
  const lastThreeRelapses = lastThree.filter(
    (checkin) => checkin.status === "relapsed",
  );

  if (lastThreeRelapses.length >= 2) {
    const trigger =
      lastThreeRelapses.find((checkin) => Boolean(checkin.trigger))?.trigger ??
      "momen tertentu";

    return {
      action:
        "Siapkan pengganti kecil sebelum momen itu datang: minum air, jalan 5 menit, atau tarik napas 10 kali.",
      title: `Dalam 3 hari terakhir kamu beberapa kali rawan saat ${trigger}.`,
    };
  }

  if (recentRelapses.length > 0) {
    const insight = getRelapseInsights(recent);
    const trigger = insight.topTrigger?.name ?? "trigger yang mirip";

    return {
      action:
        "Coba tulis satu rencana cadangan untuk trigger itu hari ini. Kecil saja, yang penting bisa dilakukan.",
      title: `Minggu ini pola rawanmu mulai terlihat: ${trigger}.`,
    };
  }

  if (recentSmokeFree.length >= 3) {
    return {
      action:
        "Pertahankan ritme yang sama. Jangan tunggu craving datang untuk menyiapkan strategi.",
      title: "Beberapa hari terakhir kamu sedang membangun momentum bagus.",
    };
  }

  if (recentReduced.length >= 2) {
    return {
      action:
        "Besok coba turunkan satu batang lagi atau geser jam rokok pertama lebih lambat.",
      title: "Mengurangi tetap progress. Tubuhmu sedang belajar pola baru.",
    };
  }

  return {
    action:
      "Mulai dari satu check-in jujur hari ini. Data kecil itu nanti jadi kompas perjalananmu.",
    title: "Belum banyak data, tapi kamu sudah mulai punya sistem.",
  };
}

export function buildLocalLeaderboard(
  profile: Profile | null,
  checkins: DailyCheckin[],
): LeaderboardEntry[] {
  if (!profile || checkins.length === 0) {
    return [];
  }

  const activeSmokeFreeStreak = getCurrentSmokeFreeStreak(checkins);

  if (activeSmokeFreeStreak === 0) {
    return [];
  }

  const smokeFreeDays = checkins.filter(
    (checkin) => checkin.status === "smoke_free",
  ).length;
  const reducedDays = checkins.filter(
    (checkin) => checkin.status === "reduced",
  ).length;
  const relapseDays = checkins.filter(
    (checkin) => checkin.status === "relapsed",
  ).length;

  return [
    {
      activeBadge: getStreakBadge(activeSmokeFreeStreak),
      checkinCount: checkins.length,
      consistencyScore: activeSmokeFreeStreak * 100 + smokeFreeDays * 2,
      currentStreak: activeSmokeFreeStreak,
      lastCheckin: checkins[checkins.length - 1]?.date,
      name: profile.name,
      rank: 1,
      reducedDays,
      relapseDays,
      smokeFreeDays,
    },
  ];
}

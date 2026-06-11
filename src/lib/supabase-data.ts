import { supabase } from "@/lib/supabase";
import { getStreakBadge, parseCigaretteBrands } from "@/lib/mvp-store";
import type {
  CheckinStatus,
  CommunityPost,
  CravingLog,
  DailyCheckin,
  DonationAllocation,
  JournalEntry,
  LeaderboardEntry,
  Mood,
  NotificationSettings,
  Profile,
  Reward,
  TargetType,
  UserBadge,
} from "@/lib/mvp-store";

type SupabaseLeaderboardRow = {
  checkin_count: number | string;
  consistency_score: number | string;
  current_streak: number | string;
  last_checkin: string | null;
  name: string;
  reduced_days: number | string;
  relapse_days: number | string;
  smoke_free_days: number | string;
};

export async function getCurrentUserId() {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function readSupabaseProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    age: data.age ?? undefined,
    cigaretteBrand: data.cigarette_brand ?? undefined,
    cigaretteBrands:
      data.cigarette_brands ?? parseCigaretteBrands(data.cigarette_brand ?? ""),
    createdAt: data.created_at,
    name: data.name,
    packPrice: Number(data.pack_price),
    reasons: data.reason_to_quit ?? [],
    smokingStartedAge: data.smoking_started_age ?? undefined,
    smokingStartedYear: data.smoking_started_year ?? undefined,
    smokingBaselinePerDay: data.smoking_baseline_per_day,
    sticksPerPack: data.sticks_per_pack,
    targetType: data.target_type as TargetType,
    todaySmokedCount: data.today_smoked_count ?? undefined,
  };
}

export async function saveSupabaseProfile(profile: Profile) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("profiles").upsert({
    age: profile.age ?? null,
    cigarette_brand: profile.cigaretteBrand ?? null,
    cigarette_brands:
      profile.cigaretteBrands ?? parseCigaretteBrands(profile.cigaretteBrand ?? ""),
    id: userId,
    name: profile.name,
    pack_price: profile.packPrice,
    reason_to_quit: profile.reasons,
    smoking_baseline_per_day: profile.smokingBaselinePerDay,
    smoking_started_age: profile.smokingStartedAge ?? null,
    smoking_started_year: profile.smokingStartedYear ?? null,
    sticks_per_pack: profile.sticksPerPack,
    target_type: profile.targetType,
    today_smoked_count: profile.todaySmokedCount ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseCommunityPosts(): Promise<CommunityPost[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    authorName: item.author_name,
    badge: item.badge ?? undefined,
    createdAt: item.created_at,
    id: item.id,
    message: item.message,
    streakAtPost: item.streak_at_post,
    supportCount: item.support_count,
    userId: item.user_id,
  }));
}

export async function saveSupabaseCommunityPost(
  post: Omit<CommunityPost, "id" | "supportCount">,
) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_name: post.authorName,
      badge: post.badge ?? null,
      created_at: post.createdAt,
      message: post.message,
      streak_at_post: post.streakAtPost,
      support_count: 0,
      user_id: userId,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    authorName: data.author_name,
    badge: data.badge ?? undefined,
    createdAt: data.created_at,
    id: data.id,
    message: data.message,
    streakAtPost: data.streak_at_post,
    supportCount: data.support_count,
    userId: data.user_id,
  } satisfies CommunityPost;
}

export async function deleteSupabaseCommunityPost(postId: string) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
}

export async function reportSupabaseCommunityPost(postId: string) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("community_post_reports").upsert(
    {
      post_id: postId,
      reporter_id: userId,
    },
    { onConflict: "post_id,reporter_id" },
  );

  if (error) {
    throw error;
  }

  return true;
}

export async function supportSupabaseCommunityPost(postId: string) {
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.rpc("support_community_post", {
    post_id: postId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseCheckins(): Promise<DailyCheckin[]> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    createdAt: item.created_at,
    date: item.date,
    mood: item.mood as Mood | undefined,
    note: item.note ?? "",
    smokedCount: item.smoked_count,
    status: item.status as CheckinStatus,
    trigger: item.trigger ?? "",
  }));
}

export async function saveSupabaseCheckin(checkin: DailyCheckin) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      date: checkin.date,
      mood: checkin.mood,
      note: checkin.note,
      smoked_count: checkin.smokedCount,
      status: checkin.status,
      trigger: checkin.trigger || null,
      updated_at: new Date().toISOString(),
      user_id: userId,
    },
    { onConflict: "user_id,date" },
  );

  if (error) {
    throw error;
  }

  return true;
}

export async function deleteSupabaseCheckin(date: string) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from("daily_checkins")
    .delete()
    .eq("user_id", userId)
    .eq("date", date);

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseCravingLogs(): Promise<CravingLog[]> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("craving_logs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    createdAt: item.created_at,
    date: item.date,
    note: item.note ?? "",
    status: item.status as CravingLog["status"],
  }));
}

export async function saveSupabaseCravingLog(log: CravingLog) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("craving_logs").insert({
    date: log.date,
    note: log.note,
    status: log.status,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseJournals(): Promise<JournalEntry[]> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    challenge: item.challenge ?? "",
    createdAt: item.created_at,
    date: item.date,
    gratitude: item.gratitude ?? "",
    mood: item.mood as Mood | undefined,
    story: item.story ?? "",
    tomorrowFocus: item.tomorrow_focus ?? "",
  }));
}

export async function saveSupabaseJournal(entry: JournalEntry) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("journals").upsert(
    {
      challenge: entry.challenge,
      date: entry.date,
      gratitude: entry.gratitude,
      mood: entry.mood,
      story: entry.story,
      tomorrow_focus: entry.tomorrowFocus,
      updated_at: new Date().toISOString(),
      user_id: userId,
    },
    { onConflict: "user_id,date" },
  );

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseReward(): Promise<Reward | null> {
  const rewards = await readSupabaseRewards();
  return rewards[0] ?? null;
}

export async function readSupabaseRewards(): Promise<Reward[]> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    category: item.category ?? undefined,
    createdAt: item.created_at,
    id: item.id,
    targetAmount: Number(item.target_amount),
    title: item.title,
  }));
}

export async function saveSupabaseReward(reward: Reward) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("rewards").upsert({
    category: reward.category ?? null,
    id: reward.id,
    target_amount: reward.targetAmount,
    title: reward.title,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseDonationAllocations(): Promise<
  DonationAllocation[]
> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("donation_allocations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    amount: Number(item.amount),
    createdAt: item.created_at,
    id: item.id,
    note: item.note ?? "",
    rewardId: item.reward_id ?? "",
    title: item.title,
  }));
}

export async function saveSupabaseDonationAllocation(
  allocation: DonationAllocation,
) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("donation_allocations").insert({
    amount: allocation.amount,
    id: allocation.id,
    note: allocation.note || null,
    reward_id: allocation.rewardId || null,
    title: allocation.title,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseUserBadges(): Promise<UserBadge[]> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    description: item.badge_description,
    name: item.badge_name,
    unlockedAt: item.unlocked_at,
  }));
}

export async function unlockSupabaseUserBadges(
  badges: Pick<UserBadge, "description" | "name">[],
): Promise<UserBadge[]> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId || badges.length === 0) {
    return [];
  }

  const existingBadges = await readSupabaseUserBadges();
  const existingNames = new Set(existingBadges.map((badge) => badge.name));
  const now = new Date().toISOString();
  const newlyUnlocked = badges
    .filter((badge) => !existingNames.has(badge.name))
    .map((badge) => ({
      description: badge.description,
      name: badge.name,
      unlockedAt: now,
    }));

  if (newlyUnlocked.length === 0) {
    return [];
  }

  const { error } = await supabase.from("user_badges").upsert(
    newlyUnlocked.map((badge) => ({
      badge_description: badge.description,
      badge_name: badge.name,
      unlocked_at: badge.unlockedAt,
      user_id: userId,
    })),
    { onConflict: "user_id,badge_name" },
  );

  if (error) {
    throw error;
  }

  return newlyUnlocked;
}

export async function readSupabaseNotificationSettings(): Promise<NotificationSettings> {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return {
      enabled: false,
      reminderHour: 20,
    };
  }

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return {
      enabled: false,
      reminderHour: 20,
    };
  }

  return {
    enabled: data.enabled,
    lastNotifiedDate: data.last_notified_date ?? undefined,
    reminderHour: data.reminder_hour,
  };
}

export async function saveSupabaseNotificationSettings(
  settings: NotificationSettings,
) {
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from("notification_settings").upsert({
    enabled: settings.enabled,
    last_notified_date: settings.lastNotifiedDate ?? null,
    reminder_hour: settings.reminderHour,
    updated_at: new Date().toISOString(),
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function readSupabaseLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_leaderboard", {
    limit_count: 20,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SupabaseLeaderboardRow[]).map((item, index) => ({
    activeBadge: getStreakBadge(Number(item.current_streak)),
    checkinCount: Number(item.checkin_count),
    consistencyScore: Number(item.consistency_score),
    currentStreak: Number(item.current_streak),
    lastCheckin: item.last_checkin ?? undefined,
    name: item.name,
    rank: index + 1,
    reducedDays: Number(item.reduced_days),
    relapseDays: Number(item.relapse_days),
    smokeFreeDays: Number(item.smoke_free_days),
  }));
}

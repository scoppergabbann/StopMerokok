import {
  readCheckins,
  readCommunityPosts,
  deleteCommunityPost,
  readCravingLogs,
  readDonationAllocations,
  readJournals,
  readNotificationSettings,
  readProfile,
  readReward,
  readRewards,
  readUserBadges,
  saveCheckin,
  saveCommunityPost,
  saveCravingLog,
  saveDonationAllocation,
  saveJournal,
  saveNotificationSettings,
  saveProfile,
  saveReward,
  unlockUserBadges,
  deleteCheckin,
  supportCommunityPost,
  type Badge,
  type CommunityPost,
  type CravingLog,
  type DailyCheckin,
  type DonationAllocation,
  type JournalEntry,
  type LeaderboardEntry,
  type NotificationSettings,
  type Profile,
  type Reward,
  buildLocalLeaderboard,
} from "@/lib/mvp-store";
import {
  readSupabaseCheckins,
  readSupabaseCommunityPosts,
  deleteSupabaseCommunityPost,
  readSupabaseCravingLogs,
  readSupabaseDonationAllocations,
  readSupabaseJournals,
  readSupabaseNotificationSettings,
  readSupabaseLeaderboard,
  readSupabaseProfile,
  readSupabaseReward,
  readSupabaseRewards,
  readSupabaseUserBadges,
  saveSupabaseCheckin,
  saveSupabaseCommunityPost,
  deleteSupabaseCheckin,
  saveSupabaseCravingLog,
  saveSupabaseDonationAllocation,
  saveSupabaseJournal,
  saveSupabaseNotificationSettings,
  saveSupabaseProfile,
  saveSupabaseReward,
  unlockSupabaseUserBadges,
  supportSupabaseCommunityPost,
  reportSupabaseCommunityPost,
  getCurrentUserId,
} from "@/lib/supabase-data";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function loadProfile() {
  return isSupabaseConfigured ? readSupabaseProfile() : readProfile();
}

export async function persistProfile(profile: Profile) {
  if (isSupabaseConfigured) {
    return saveSupabaseProfile(profile);
  }

  saveProfile(profile);
  return true;
}

export async function loadCheckins() {
  return isSupabaseConfigured ? readSupabaseCheckins() : readCheckins();
}

export async function persistCheckin(checkin: DailyCheckin) {
  if (isSupabaseConfigured) {
    return saveSupabaseCheckin(checkin);
  }

  saveCheckin(checkin);
  return true;
}

export async function removeCheckin(date: string) {
  if (isSupabaseConfigured) {
    return deleteSupabaseCheckin(date);
  }

  deleteCheckin(date);
  return true;
}

export async function loadCravingLogs() {
  return isSupabaseConfigured ? readSupabaseCravingLogs() : readCravingLogs();
}

export async function persistCravingLog(log: CravingLog) {
  if (isSupabaseConfigured) {
    return saveSupabaseCravingLog(log);
  }

  saveCravingLog(log);
  return true;
}

export async function loadJournals() {
  return isSupabaseConfigured ? readSupabaseJournals() : readJournals();
}

export async function persistJournal(entry: JournalEntry) {
  if (isSupabaseConfigured) {
    return saveSupabaseJournal(entry);
  }

  saveJournal(entry);
  return true;
}

export async function loadReward() {
  return isSupabaseConfigured ? readSupabaseReward() : readReward();
}

export async function loadRewards() {
  return isSupabaseConfigured ? readSupabaseRewards() : readRewards();
}

export async function persistReward(reward: Reward) {
  if (isSupabaseConfigured) {
    return saveSupabaseReward(reward);
  }

  saveReward(reward);
  return true;
}

export async function loadDonationAllocations() {
  return isSupabaseConfigured
    ? readSupabaseDonationAllocations()
    : readDonationAllocations();
}

export async function persistDonationAllocation(
  allocation: DonationAllocation,
) {
  if (isSupabaseConfigured) {
    return saveSupabaseDonationAllocation(allocation);
  }

  saveDonationAllocation(allocation);
  return true;
}

export async function loadUserBadges() {
  return isSupabaseConfigured ? readSupabaseUserBadges() : readUserBadges();
}

export async function persistUnlockedBadges(badges: Badge[]) {
  const unlockedBadges = badges
    .filter((badge) => badge.isUnlocked)
    .map((badge) => ({
      description: badge.description,
      name: badge.name,
    }));

  if (isSupabaseConfigured) {
    return unlockSupabaseUserBadges(unlockedBadges);
  }

  return unlockUserBadges(badges);
}

export async function loadNotificationSettings() {
  return isSupabaseConfigured
    ? readSupabaseNotificationSettings()
    : readNotificationSettings();
}

export async function persistNotificationSettings(
  settings: NotificationSettings,
) {
  if (isSupabaseConfigured) {
    return saveSupabaseNotificationSettings(settings);
  }

  saveNotificationSettings(settings);
  return true;
}

export async function loadLeaderboard(
  profile?: Profile | null,
  checkins?: DailyCheckin[],
): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured) {
    return readSupabaseLeaderboard();
  }

  return buildLocalLeaderboard(profile ?? null, checkins ?? []);
}

export async function loadCommunityPosts() {
  return isSupabaseConfigured
    ? readSupabaseCommunityPosts()
    : readCommunityPosts();
}

export async function persistCommunityPost(
  post: Omit<CommunityPost, "id" | "supportCount">,
) {
  if (isSupabaseConfigured) {
    return saveSupabaseCommunityPost(post);
  }

  const storedPost: CommunityPost = {
    ...post,
    id: crypto.randomUUID(),
    supportCount: 0,
    userId: "local-user",
  };
  saveCommunityPost(storedPost);
  return storedPost;
}

export async function sendCommunitySupport(postId: string) {
  if (isSupabaseConfigured) {
    return supportSupabaseCommunityPost(postId);
  }

  supportCommunityPost(postId);
  return true;
}

export async function removeCommunityPost(postId: string) {
  if (isSupabaseConfigured) {
    return deleteSupabaseCommunityPost(postId);
  }

  deleteCommunityPost(postId);
  return true;
}

export async function reportCommunityPost(postId: string) {
  if (isSupabaseConfigured) {
    return reportSupabaseCommunityPost(postId);
  }

  return true;
}

export async function loadCurrentUserId() {
  if (isSupabaseConfigured) {
    return getCurrentUserId();
  }

  return "local-user";
}

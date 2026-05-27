import {
  readCheckins,
  readCravingLogs,
  readJournals,
  readNotificationSettings,
  readProfile,
  readReward,
  readUserBadges,
  saveCheckin,
  saveCravingLog,
  saveJournal,
  saveNotificationSettings,
  saveProfile,
  saveReward,
  unlockUserBadges,
  type Badge,
  type CravingLog,
  type DailyCheckin,
  type JournalEntry,
  type NotificationSettings,
  type Profile,
  type Reward,
} from "@/lib/mvp-store";
import {
  readSupabaseCheckins,
  readSupabaseCravingLogs,
  readSupabaseJournals,
  readSupabaseNotificationSettings,
  readSupabaseProfile,
  readSupabaseReward,
  readSupabaseUserBadges,
  saveSupabaseCheckin,
  saveSupabaseCravingLog,
  saveSupabaseJournal,
  saveSupabaseNotificationSettings,
  saveSupabaseProfile,
  saveSupabaseReward,
  unlockSupabaseUserBadges,
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

export async function persistReward(reward: Reward) {
  if (isSupabaseConfigured) {
    return saveSupabaseReward(reward);
  }

  saveReward(reward);
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

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Flame,
  MessageCircleHeart,
  Send,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import {
  loadCheckins,
  loadCommunityPosts,
  loadCurrentUserId,
  loadLeaderboard,
  loadProfile,
  persistCommunityPost,
  removeCommunityPost,
  reportCommunityPost,
  sendCommunitySupport,
} from "@/lib/client-data";
import {
  calculateSummary,
  getCurrentSmokeFreeStreak,
  getStreakBadge,
  type CommunityPost,
  type DailyCheckin,
  type LeaderboardEntry,
  type Profile,
} from "@/lib/mvp-store";

const challengeTargets = [
  {
    days: 7,
    label: "7 hari",
    title: "Tantangan awal",
  },
  {
    days: 30,
    label: "30 hari",
    title: "Bangun ritme",
  },
  {
    days: 90,
    label: "3 bulan",
    title: "Level kuat",
  },
];

const supportPrompts = [
  "Hari ini berat, tapi aku tetap hadir.",
  "Aku berhasil melewati craving hari ini.",
  "Butuh semangat untuk lanjut besok.",
];

const blockedWords = [
  "anjing",
  "bangsat",
  "babi",
  "kontol",
  "memek",
  "tolol",
];

function getCommunityLevel(streak: number) {
  if (streak >= 90) {
    return "Veteran";
  }

  if (streak >= 31) {
    return "Kuat";
  }

  if (streak >= 8) {
    return "Membangun";
  }

  return "Pemula";
}

export default function CommunityPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedSupport, setSelectedSupport] = useState(supportPrompts[0]);
  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [supportingPostId, setSupportingPostId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [moderatingPostId, setModeratingPostId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([
        loadProfile(),
        loadCheckins(),
        loadCommunityPosts(),
        loadCurrentUserId(),
      ]).then(
        ([nextProfile, nextCheckins, nextPosts, nextUserId]) => {
          setProfile(nextProfile);
          setCheckins(nextCheckins);
          setPosts(nextPosts);
          setCurrentUserId(nextUserId);
          loadLeaderboard(nextProfile, nextCheckins).then(setLeaderboard);
        },
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = useMemo(
    () => calculateSummary(profile, checkins),
    [profile, checkins],
  );
  const activeStreak = getCurrentSmokeFreeStreak(checkins);
  const activeBadge = getStreakBadge(activeStreak);
  const communityLevel = getCommunityLevel(activeStreak);
  const topThree = leaderboard.slice(0, 3);

  async function handleSubmitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 3) {
      showToast({
        message: "Tulis minimal 3 karakter.",
        title: "Pesan terlalu pendek",
        variant: "info",
      });
      return;
    }

    const normalizedMessage = trimmedMessage.toLowerCase();
    const hasBlockedWord = blockedWords.some((word) =>
      normalizedMessage.includes(word),
    );

    if (hasBlockedWord) {
      showToast({
        message: "Pakai kata yang lebih aman dan suportif ya.",
        title: "Pesan belum bisa dikirim",
        variant: "info",
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayPostCount = posts.filter(
      (post) =>
        post.userId === currentUserId && post.createdAt.slice(0, 10) === today,
    ).length;

    if (todayPostCount >= 3) {
      showToast({
        message: "Batas posting hari ini 3 pesan agar wall tetap nyaman.",
        title: "Batas harian tercapai",
        variant: "info",
      });
      return;
    }

    setIsPosting(true);

    try {
      const post = await persistCommunityPost({
        authorName: profile?.name ?? "Teman",
        badge: activeBadge,
        createdAt: new Date().toISOString(),
        message: trimmedMessage,
        streakAtPost: activeStreak,
      });

      if (post) {
        setPosts((current) => [post, ...current].slice(0, 30));
      }

      setMessage("");
      showToast({
        message: "Dukunganmu sudah masuk ke komunitas.",
        title: "Terkirim",
        variant: "success",
      });
    } catch {
      showToast({
        message: "Coba kirim lagi sebentar lagi.",
        title: "Gagal mengirim",
        variant: "info",
      });
    } finally {
      setIsPosting(false);
    }
  }

  async function handleSupportPost(postId: string) {
    setSupportingPostId(postId);

    try {
      await sendCommunitySupport(postId);
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, supportCount: post.supportCount + 1 }
            : post,
        ),
      );
    } catch {
      showToast({
        message: "Dukungan belum terkirim. Coba lagi nanti.",
        title: "Gagal memberi semangat",
        variant: "info",
      });
    } finally {
      setSupportingPostId(null);
    }
  }

  async function handleDeletePost(postId: string) {
    const confirmed = window.confirm("Hapus pesan dukungan ini?");

    if (!confirmed) {
      return;
    }

    setModeratingPostId(postId);

    try {
      await removeCommunityPost(postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      showToast({
        message: "Pesan sudah dihapus.",
        title: "Terhapus",
        variant: "success",
      });
    } catch {
      showToast({
        message: "Coba hapus lagi sebentar lagi.",
        title: "Gagal menghapus",
        variant: "info",
      });
    } finally {
      setModeratingPostId(null);
    }
  }

  async function handleReportPost(postId: string) {
    setModeratingPostId(postId);

    try {
      await reportCommunityPost(postId);
      showToast({
        message: "Terima kasih. Laporanmu sudah dicatat.",
        title: "Pesan dilaporkan",
        variant: "success",
      });
    } catch {
      showToast({
        message: "Coba laporkan lagi sebentar lagi.",
        title: "Gagal melaporkan",
        variant: "info",
      });
    } finally {
      setModeratingPostId(null);
    }
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-[#1F2933] p-5 text-white shadow-xl shadow-slate-300/60 sm:p-6">
          <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
            Komunitas
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-extrabold">
                Bertahan bareng, satu hari dulu.
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Lihat challenge, ranking streak aktif, dan ambil dukungan kecil
                saat perjalanan terasa berat.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-sm font-bold text-slate-300">Level kamu</p>
              <p className="mt-1 text-2xl font-extrabold">{communityLevel}</p>
              <p className="mt-1 text-sm font-semibold text-[#9DE5BD]">
                {activeStreak} hari streak aktif
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <Flame className="size-7 text-[#4FAE7B]" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Current streak
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {activeStreak} hari
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <Trophy className="size-7 text-[#36798D]" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Badge aktif
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {activeBadge ?? "Belum terbuka"}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <UsersRound className="size-7 text-[#4FAE7B]" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Peserta aktif
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {leaderboard.length} orang
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                Challenge bersama
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Pilih target kecil yang bisa dijaga
              </h2>
            </div>
            <Link
              className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]"
              href="/check-in"
            >
              Check-in hari ini
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {challengeTargets.map((challenge) => {
              const progress = Math.min(activeStreak, challenge.days);
              const percentage = Math.min(
                100,
                (progress / challenge.days) * 100,
              );
              const isComplete = progress >= challenge.days;

              return (
                <div
                  className="rounded-3xl border border-slate-100 bg-[#F6F8F7] p-4"
                  key={challenge.days}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        {challenge.title}
                      </p>
                      <h3 className="mt-1 text-xl font-extrabold">
                        {challenge.label}
                      </h3>
                    </div>
                    {isComplete && (
                      <span className="grid size-9 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
                        <CheckCircle2 className="size-5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#4FAE7B]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    {progress} dari {challenge.days} hari
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                  Ranking aktif
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Top streak komunitas
                </h2>
              </div>
              <Link
                className="rounded-full bg-[#E3F3F7] px-4 py-2 text-sm font-extrabold text-[#36798D]"
                href="/stats"
              >
                Detail
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {topThree.length === 0 ? (
                <p className="rounded-2xl bg-[#F6F8F7] p-4 font-semibold text-slate-600">
                  Belum ada peserta aktif hari ini.
                </p>
              ) : (
                topThree.map((entry) => (
                  <div
                    className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-2xl bg-[#F6F8F7] p-3"
                    key={`${entry.rank}-${entry.name}`}
                  >
                    <div className="grid size-11 place-items-center rounded-2xl bg-white font-extrabold text-[#2F7D57]">
                      #{entry.rank}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold">{entry.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {entry.activeBadge ?? "Belum ada badge"}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-[#2F7D57]">
                      {entry.currentStreak} hari
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
            <MessageCircleHeart className="size-7 text-[#36798D]" />
            <h2 className="mt-4 text-2xl font-extrabold">
              Dukungan cepat
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              Pilih kalimat kecil untuk mengingatkan diri sendiri bahwa kamu
              tidak harus sempurna untuk tetap lanjut.
            </p>

            <div className="mt-5 space-y-2">
              {supportPrompts.map((prompt) => (
                <button
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                    selectedSupport === prompt
                      ? "bg-white text-[#1F2933] shadow-sm"
                      : "bg-white/45 text-[#36798D] hover:bg-white/75"
                  }`}
                  key={prompt}
                  onClick={() => setSelectedSupport(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-3xl bg-white p-4">
              <p className="text-sm font-bold text-slate-500">Kalimat hari ini</p>
              <p className="mt-2 text-lg font-extrabold leading-8">
                {selectedSupport}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Statistikmu mencatat {summary.smokeFreeDays} hari bebas rokok.
                Tetap mulai dari hari ini.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                Wall dukungan
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Pesan singkat untuk saling menguatkan
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Bagikan progress kecil atau minta semangat. Tetap ringan,
                singkat, dan aman untuk semua.
              </p>
            </div>
            <Sparkles className="hidden size-8 text-[#4FAE7B] sm:block" />
          </div>

          <form className="mt-5 space-y-3" onSubmit={handleSubmitPost}>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">
                Tulis pesan
              </span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-[#F6F8F7] px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-[#4FAE7B] focus:bg-white"
                maxLength={180}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Contoh: Aku berhasil melewati craving sore ini."
                value={message}
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold text-slate-400">
                {message.length}/180 karakter
              </p>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPosting}
                type="submit"
              >
                <Send className="size-4" />
                {isPosting ? "Mengirim..." : "Kirim dukungan"}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {posts.length === 0 ? (
              <p className="rounded-2xl bg-[#F6F8F7] p-4 font-semibold text-slate-600">
                Belum ada pesan dukungan. Kamu bisa jadi yang pertama hari ini.
              </p>
            ) : (
              posts.map((post) => (
                <article
                  className="rounded-3xl border border-slate-100 bg-[#F6F8F7] p-4"
                  key={post.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-extrabold">{post.authorName}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Streak {post.streakAtPost} hari
                        {post.badge ? ` - ${post.badge}` : ""}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p className="mt-3 leading-7 text-slate-700">
                    {post.message}
                  </p>
                  <button
                    className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-[#36798D] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={supportingPostId === post.id}
                    onClick={() => handleSupportPost(post.id)}
                    type="button"
                  >
                    Semangat {post.supportCount}
                  </button>
                  {post.userId === currentUserId ? (
                    <button
                      className="ml-2 mt-4 inline-flex rounded-2xl bg-[#FBE3E3] px-4 py-2 text-sm font-extrabold text-[#B75D5D] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={moderatingPostId === post.id}
                      onClick={() => handleDeletePost(post.id)}
                      type="button"
                    >
                      Hapus
                    </button>
                  ) : (
                    <button
                      className="ml-2 mt-4 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={moderatingPostId === post.id}
                      onClick={() => handleReportPost(post.id)}
                      type="button"
                    >
                      Report
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

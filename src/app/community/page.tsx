"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Flame,
  MessageCircleHeart,
  Send,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { trackEvent } from "@/lib/analytics";
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

const supportPrompts = [
  "Hari ini berat, tapi aku tetap hadir.",
  "Aku berhasil melewati dorongan merokok hari ini.",
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
  const [isLoading, setIsLoading] = useState(true);
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
      ]).then(([nextProfile, nextCheckins, nextPosts, nextUserId]) => {
        setProfile(nextProfile);
        setCheckins(nextCheckins);
        setPosts(nextPosts);
        setCurrentUserId(nextUserId);
        loadLeaderboard(nextProfile, nextCheckins).then(setLeaderboard);
        setIsLoading(false);
      });
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
  const visiblePosts = posts.slice(0, 8);

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
        message: "Batas unggahan hari ini 3 pesan agar ruang dukungan tetap nyaman.",
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

      trackEvent("community_post", {
        hasBadge: Boolean(activeBadge),
        messageLength: trimmedMessage.length,
        streak: activeStreak,
      });

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

  if (isLoading) {
    return (
      <AppShell>
        <CommunitySkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-6 text-white shadow-xl shadow-slate-300/70">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                Komunitas
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Ruang kecil untuk saling menguatkan.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                Tidak perlu cerita panjang. Satu kalimat jujur sudah cukup
                untuk merasa tidak sendirian hari ini.
              </p>
            </div>
            <div className="rounded-[1.6rem] bg-white/10 p-5">
              <p className="text-sm font-bold text-slate-300">Level kamu</p>
              <p className="mt-1 text-3xl font-extrabold">{communityLevel}</p>
              <p className="mt-1 text-sm font-semibold text-[#9DE5BD]">
                {activeStreak} hari rentetan aktif
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat icon={Flame} label="Rentetan" value={`${activeStreak} hari`} />
          <MiniStat
            icon={Trophy}
            label="Lencana"
            value={activeBadge ?? "Belum terbuka"}
          />
          <MiniStat
            icon={UsersRound}
            label="Peserta aktif"
            value={`${leaderboard.length} orang`}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
                <MessageCircleHeart className="size-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                  Tulis dukungan
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Bagikan satu kalimat hari ini
                </h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Bisa progres kecil, minta semangat, atau kalimat yang ingin
                  kamu ingat besok.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {supportPrompts.map((prompt) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    selectedSupport === prompt
                      ? "bg-[#DFF3E8] text-[#2F7D57]"
                      : "bg-[#F6F8F7] text-slate-500 hover:bg-[#E3F3F7]"
                  }`}
                  key={prompt}
                  onClick={() => {
                    setSelectedSupport(prompt);
                    setMessage(prompt);
                  }}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleSubmitPost}>
              <textarea
                className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-[#F6F8F7] px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-[#4FAE7B] focus:bg-white"
                maxLength={180}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Contoh: Aku berhasil melewati dorongan merokok sore ini."
                value={message}
              />
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
          </section>

          <aside className="rounded-[2rem] bg-[#E3F3F7] p-5">
            <Sparkles className="size-7 text-[#36798D]" />
            <h2 className="mt-4 text-2xl font-extrabold">Pengingat lembut</h2>
            <p className="mt-2 leading-7 text-slate-700">
              Komunitas ini bukan tempat membandingkan siapa paling kuat.
              Tujuannya sederhana: saling mengingatkan untuk kembali mencoba.
            </p>
            <div className="mt-5 rounded-3xl bg-white/75 p-4">
              <p className="text-sm font-bold text-slate-500">
                Progressmu
              </p>
              <p className="mt-2 text-lg font-extrabold">
                {summary.smokeFreeDays} hari bebas rokok tercatat
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Tetap mulai dari hari ini, bukan dari ekspektasi orang lain.
              </p>
            </div>
          </aside>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                  Peringkat mini
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Rentetan aktif
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
                <EmptyState
                  actionHref="/check-in"
                  actionLabel="Absen bebas rokok"
                  body="Peringkat mini muncul setelah ada peserta yang menjaga rentetan aktif."
                  icon={Trophy}
                  title="Peringkat masih kosong"
                />
              ) : (
                topThree.map((entry) => (
                  <div
                    className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl bg-[#F6F8F7] p-3"
                    key={`${entry.rank}-${entry.name}`}
                  >
                    <div className="grid size-10 place-items-center rounded-2xl bg-white font-extrabold text-[#2F7D57]">
                      #{entry.rank}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold">{entry.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {entry.activeBadge ?? "Belum ada lencana"}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-[#2F7D57]">
                      {entry.currentStreak} hari
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                  Ruang dukungan
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Pesan terbaru
                </h2>
              </div>
              <span className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]">
                {posts.length} pesan
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {visiblePosts.length === 0 ? (
                <EmptyState
                  body="Tulis satu pesan singkat di form atas. Bisa progres kecil, minta semangat, atau kalimat yang ingin kamu ingat besok."
                  icon={MessageCircleHeart}
                  title="Belum ada pesan dukungan"
                />
              ) : (
                visiblePosts.map((post) => (
                  <article
                    className="rounded-3xl border border-slate-100 bg-[#F6F8F7] p-4"
                    key={post.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-extrabold">{post.authorName}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Rentetan {post.streakAtPost} hari
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-[#36798D] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={supportingPostId === post.id}
                        onClick={() => handleSupportPost(post.id)}
                        type="button"
                      >
                        Semangat {post.supportCount}
                      </button>
                      {post.userId === currentUserId ? (
                        <button
                          className="inline-flex rounded-2xl bg-[#FBE3E3] px-4 py-2 text-sm font-extrabold text-[#B75D5D] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={moderatingPostId === post.id}
                          onClick={() => handleDeletePost(post.id)}
                          type="button"
                        >
                          Hapus
                        </button>
                      ) : (
                        <button
                          className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={moderatingPostId === post.id}
                          onClick={() => handleReportPost(post.id)}
                          type="button"
                        >
                          Laporkan
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {posts.length > visiblePosts.length && (
              <p className="mt-4 text-center text-sm font-bold text-slate-500">
                Menampilkan {visiblePosts.length} pesan terbaru agar halaman
                tetap ringan.
              </p>
            )}
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
      <Icon className="size-6 text-[#4FAE7B]" />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function CommunitySkeleton() {
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="h-56 rounded-[2rem] bg-white skeleton-shimmer" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
        <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
      </div>
      <div className="h-80 rounded-[2rem] bg-white skeleton-shimmer" />
    </section>
  );
}

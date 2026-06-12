"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BellRing,
  Bug,
  CalendarDays,
  Cigarette,
  Coins,
  HeartHandshake,
  Leaf,
  Pencil,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { loadNotificationSettings, loadProfile } from "@/lib/client-data";
import {
  formatRupiah,
  getCigaretteBrandText,
  parseCigaretteBrands,
  targetLabels,
  type NotificationSettings,
  type Profile,
  type TargetType,
} from "@/lib/mvp-store";
import { clearRememberedAuthSession, isSupabaseConfigured, supabase } from "@/lib/supabase";

const reasonCopy: Record<string, string> = {
  Anak: "Mempersiapkan masa depan yang lebih bersih dan sehat.",
  Finansial:
    "Uang yang dulu jadi asap bisa diarahkan ke hal yang lebih berarti.",
  "Ibadah / spiritual": "Menjaga tubuh sebagai bentuk tanggung jawab.",
  Keluarga: "Karena ada orang-orang yang ingin kamu jaga lebih lama.",
  Kesehatan: "Biar napas lebih lega dan tubuh terasa lebih ringan.",
  Lainnya: "Ada alasan pribadi yang layak kamu hormati pelan-pelan.",
  Pasangan: "Menjadi versi diri yang lebih baik untuk hubungan yang lebih sehat.",
};

const targetDescriptions: Record<TargetType, string> = {
  quit_total:
    "Kamu sedang mencoba membangun hari-hari yang lebih bersih, satu hari dalam satu waktu.",
  reduce_slowly:
    "Kamu tidak sedang dipaksa sempurna. Target ini membantu kamu menurunkan kebiasaan sedikit demi sedikit.",
  seven_days:
    "Tujuh hari pertama adalah latihan hadir. Pendek, jelas, dan cukup untuk mulai membangun percaya diri.",
  thirty_days:
    "Tiga puluh hari memberi tubuh ruang untuk mengenali ritme baru yang lebih ringan.",
};

function getJourneyDays(profile: Profile) {
  const createdAt = new Date(profile.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return 1;
  }

  const elapsed = Date.now() - createdAt.getTime();
  return Math.max(1, Math.floor(elapsed / (24 * 60 * 60 * 1000)) + 1);
}

function getSmokingDuration(profile: Profile) {
  const now = new Date();

  if (profile.smokingStartedYear) {
    const years = Math.max(0, now.getFullYear() - profile.smokingStartedYear);
    return years === 0 ? "Kurang dari 1 tahun" : `${years} tahun`;
  }

  if (profile.age && profile.smokingStartedAge) {
    const years = Math.max(0, profile.age - profile.smokingStartedAge);
    return years === 0 ? "Kurang dari 1 tahun" : `${years} tahun`;
  }

  return "Belum tercatat";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([loadProfile(), loadNotificationSettings()]).then(
        ([nextProfile, nextSettings]) => {
          setProfile(nextProfile);
          setSettings(nextSettings);
          setIsLoading(false);
        },
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const journeyDays = useMemo(
    () => (profile ? getJourneyDays(profile) : 0),
    [profile],
  );

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    clearRememberedAuthSession();
    showToast({
      message: "Kamu keluar dari sesi saat ini.",
      title: "Keluar berhasil",
      variant: "success",
    });
    window.setTimeout(() => router.push("/"), 400);
  }

  if (isLoading) {
    return (
      <AppShell>
        <ProfileSkeleton />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Isi data awal"
          body="Lengkapi data dasar dulu agar profil perjalanan, penghematan, target, dan wawasan harian bisa terasa personal."
          icon={UserRound}
          title="Profil perjalanan belum lengkap"
        />
      </AppShell>
    );
  }

  const reasons = profile.reasons.length > 0 ? profile.reasons : ["Kesehatan"];
  const cigaretteBrands =
    profile.cigaretteBrands && profile.cigaretteBrands.length > 0
      ? profile.cigaretteBrands
      : parseCigaretteBrands(profile.cigaretteBrand ?? "");
  const cigaretteBrandText = getCigaretteBrandText(profile) || "Belum dicatat";

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_52%,#4FAE7B_140%)] p-5 text-white shadow-xl shadow-slate-300/70 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold uppercase text-[#B8F1CE]">
                <Leaf className="size-4" />
                Profil perjalanan
              </div>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight">
                Halo, {profile.name}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-200">
                Kamu sedang menjalani perjalanan{" "}
                {targetLabels[profile.targetType].toLowerCase()}.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
              href="/profile/edit"
            >
              <Pencil className="size-4" />
              Edit profil
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroStat label="Target aktif" value={targetLabels[profile.targetType]} />
            <HeroStat label="Hari perjalanan" value={`${journeyDays} hari`} />
            <HeroStat label="Produk rokok" value={cigaretteBrandText} />
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E3F3F7] text-[#36798D]">
              <CalendarDays className="size-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">Ringkasan perjalanan</h2>
              <p className="mt-2 leading-7 text-slate-600">
                Kebiasaan awal bukan untuk menghakimi, tapi untuk mengukur
                seberapa jauh kamu sudah berjalan.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              icon={Cigarette}
              label="Baseline rokok per hari"
              value={`${profile.smokingBaselinePerDay} batang`}
            />
            <SummaryCard
              icon={Coins}
              label="Harga satu bungkus"
              value={formatRupiah(profile.packPrice)}
            />
            <SummaryCard
              icon={Cigarette}
              label="Batang per bungkus"
              value={`${profile.sticksPerPack} batang`}
            />
            <SummaryCard
              icon={CalendarDays}
              label="Mulai sejak umur"
              value={
                profile.smokingStartedAge
                  ? `${profile.smokingStartedAge} tahun`
                  : "Belum tercatat"
              }
            />
            <SummaryCard
              icon={CalendarDays}
              label="Mulai tahun"
              value={profile.smokingStartedYear?.toString() ?? "Belum tercatat"}
            />
            <SummaryCard
              icon={Sparkles}
              label="Estimasi lama merokok"
              value={getSmokingDuration(profile)}
            />
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
          <Target className="size-7 text-[#36798D]" />
          <p className="mt-4 text-sm font-extrabold uppercase text-[#36798D]">
            Target aktif
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">
            {targetLabels[profile.targetType]}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700">
            {targetDescriptions[profile.targetType]}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold">Alasan saya berhenti</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Alasan ini bisa berubah, tapi hari ini cukup jadi pegangan kecil.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div
                className="rounded-3xl border border-[#DFF3E8] bg-[#F7FBF9] p-4"
                key={reason}
              >
                <HeartHandshake className="size-6 text-[#4FAE7B]" />
                <p className="mt-3 font-extrabold">{reason}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {reasonCopy[reason] ?? reasonCopy.Lainnya}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold">Kebiasaan awal</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-[#F6F8F7] p-4">
                <p className="text-sm font-bold text-slate-500">
                  Produk rokok
                </p>
                {cigaretteBrands.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cigaretteBrands.map((brand) => (
                      <span
                        className="rounded-full bg-[#DFF3E8] px-3 py-1 text-sm font-extrabold text-[#2F7D57]"
                        key={brand}
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 font-extrabold">-</p>
                )}
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  Daftar ini hanya membantu kamu melihat kebiasaan awal dengan
                  lebih jelas, tanpa menghakimi perjalananmu.
                </p>
              </div>
              <InfoRow
                label="Baseline per hari"
                value={`${profile.smokingBaselinePerDay} batang`}
              />
              <InfoRow
                label="Biasanya hari ini"
                value={
                  typeof profile.todaySmokedCount === "number"
                    ? `${profile.todaySmokedCount} batang`
                    : "-"
                }
              />
              <InfoRow label="Harga bungkus" value={formatRupiah(profile.packPrice)} />
              <InfoRow
                label="Isi bungkus"
                value={`${profile.sticksPerPack} batang`}
              />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold">Preferensi aplikasi</h2>
            <div className="mt-5 space-y-3">
              <PreferenceRow
                icon={BellRing}
                label="Pengingat harian"
                value={
                  settings?.enabled
                    ? `Aktif pukul ${String(settings.reminderHour).padStart(2, "0")}:00`
                    : "Belum aktif"
                }
              />
              <PreferenceRow
                icon={ShieldCheck}
                label="Mode anonim komunitas"
                value="Nama panggilan"
              />
              <PreferenceRow
                icon={Sparkles}
                label="Progress ke komunitas"
                value="Rentetan aktif"
              />
              <PreferenceRow icon={UserRound} label="Bahasa" value="Indonesia" />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Bantuan
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">Bantu rapikan StopMerokok</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Kalau ada bug, tampilan aneh, atau bagian yang membingungkan,
            kirimkan lewat form singkat. Laporan ini disiapkan agar nanti bisa
            dibaca dari admin panel.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              className="flex items-start gap-3 rounded-2xl bg-[#F6F8F7] p-4 transition hover:-translate-y-0.5"
              href="/feedback"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
                <Bug className="size-5" />
              </span>
              <span>
                <span className="block font-extrabold">Laporkan masalah</span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">
                  Bug, ide, atau bagian yang bikin bingung.
                </span>
              </span>
            </Link>
            <Link
              className="flex items-start gap-3 rounded-2xl bg-[#F6F8F7] p-4 transition hover:-translate-y-0.5"
              href="/privacy"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#E3F3F7] text-[#36798D]">
                <LockKeyhole className="size-5" />
              </span>
              <span>
                <span className="block font-extrabold">Privasi & keamanan</span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">
                  Lihat cara data progresmu dipakai.
                </span>
              </span>
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold">Akun</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Keluar dari perangkat ini kapan saja. Reset progres dibuat terpisah
            agar tidak terpencet tanpa sengaja.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-2xl bg-[#1F2933] px-5 py-3 font-extrabold text-white"
              onClick={logout}
              type="button"
            >
              Keluar
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F3C9C9] bg-[#FFF7F7] px-5 py-3 font-extrabold text-[#B75D5D]"
              onClick={() =>
                showToast({
                  message:
                    "Reset progres akan dibuat dengan konfirmasi berlapis agar data tidak terhapus tanpa sengaja.",
                  title: "Reset progres belum aktif",
                  variant: "info",
                })
              }
              type="button"
            >
              <AlertTriangle className="size-4" />
              Reset progres
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase text-slate-300">{label}</p>
      <p className="mt-2 break-words font-extrabold text-white">{value}</p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cigarette;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-[#F6F8F7] p-4">
      <Icon className="size-6 text-[#4FAE7B]" />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F6F8F7] px-4 py-3">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <span className="text-right font-extrabold">{value}</span>
    </div>
  );
}

function PreferenceRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BellRing;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#F6F8F7] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#E3F3F7] text-[#36798D]">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-extrabold">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <section className="space-y-6">
      <div className="h-64 rounded-[2rem] bg-white skeleton-shimmer" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-32 rounded-[2rem] bg-white skeleton-shimmer" />
        <div className="h-32 rounded-[2rem] bg-white skeleton-shimmer" />
        <div className="h-32 rounded-[2rem] bg-white skeleton-shimmer" />
      </div>
      <div className="h-48 rounded-[2rem] bg-white skeleton-shimmer" />
    </section>
  );
}

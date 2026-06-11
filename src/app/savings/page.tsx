"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import {
  Copy,
  HeartHandshake,
  Images,
  PiggyBank,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { loadCheckins, loadProfile } from "@/lib/client-data";
import {
  calculateSummary,
  formatRupiah,
  type DailyCheckin,
  type Profile,
} from "@/lib/mvp-store";

const supportAmounts = [
  {
    amount: 10000,
    description: "Setara satu kopi untuk bantu server tetap menyala.",
    label: "10rb",
  },
  {
    amount: 25000,
    description: "Bantu menjaga aplikasi tetap gratis untuk lebih banyak pengguna.",
    isPopular: true,
    label: "25rb",
  },
  {
    amount: 50000,
    description: "Dukung pengembangan fitur baru dan komunitas.",
    label: "50rb",
  },
  {
    amount: 100000,
    description: "Sponsor kecil untuk ruang berhenti merokok yang lebih sehat.",
    label: "100rb",
  },
];

const supportBank = {
  accountName: "Mochammad Fawwaz",
  accountNumber: "1780001929922",
  bankName: "Bank Mandiri",
};

export default function SavingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [selectedSupportAmount, setSelectedSupportAmount] = useState(
    supportAmounts[1].amount,
  );
  const [isQrVisible, setIsQrVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([loadProfile(), loadCheckins()]).then(
        ([nextProfile, nextCheckins]) => {
          setProfile(nextProfile);
          setCheckins(nextCheckins);
          setIsLoading(false);
        },
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = calculateSummary(profile, checkins);
  const packEstimate =
    profile && profile.sticksPerPack > 0
      ? summary.avoidedSticks / profile.sticksPerPack
      : 0;
  const hasSavings = summary.savedMoney > 0 || checkins.length > 0;

  async function copySupportAccount() {
    await navigator.clipboard.writeText(supportBank.accountNumber);
    showToast({
      message: "Nomor rekening dukungan sudah disalin.",
      title: "Disalin",
      variant: "success",
    });
  }

  if (isLoading) {
    return (
      <AppShell>
        <section className="space-y-5">
          <div className="h-56 animate-pulse rounded-[2rem] bg-white" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-[2rem] bg-white" />
            <div className="h-32 animate-pulse rounded-[2rem] bg-white" />
            <div className="h-32 animate-pulse rounded-[2rem] bg-white" />
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] bg-[#10231D] p-6 text-white shadow-xl shadow-slate-300/70">
          <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
            Berbagi untuk StopMerokok
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.82fr)] lg:items-start">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                Bantu StopMerokok tetap gratis dan nyaman.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                Kamu fokus menjaga hari tanpa rokok. Kami menjaga ruangnya
                tetap hidup: server, database, keamanan, dan pengembangan fitur
                yang tetap ringan tanpa iklan mengganggu.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-bold leading-8 text-slate-100">
                  Satu batang yang tidak kamu beli hari ini bisa ikut membantu
                  orang lain punya tempat untuk mulai berhenti.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <SupportPoint
                  icon={Server}
                  text="Membantu biaya server, database, dan domain."
                />
                <SupportPoint
                  icon={ShieldCheck}
                  text="Menjaga aplikasi tetap aman dan tanpa jual data pribadi."
                />
                <SupportPoint
                  icon={Sparkles}
                  text="Membantu pengembangan fitur baru yang lebih suportif."
                />
                <SupportPoint
                  icon={HeartHandshake}
                  text="Membuka akses gratis untuk lebih banyak orang yang ingin mulai."
                />
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white p-5 text-[#1F2933] shadow-2xl shadow-black/20">
              <p className="text-sm font-extrabold uppercase text-[#2F7D57]">
                Pilih dukungan
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {supportAmounts.map((support) => (
                  <button
                    className={`relative rounded-2xl border p-4 text-left transition ${
                      selectedSupportAmount === support.amount
                        ? "border-[#4FAE7B] bg-[#DFF3E8]"
                        : "border-slate-100 bg-[#F6F8F7] hover:border-[#BFE7D1]"
                    }`}
                    key={support.amount}
                    onClick={() => setSelectedSupportAmount(support.amount)}
                    type="button"
                  >
                    {support.isPopular && (
                      <span className="absolute -top-3 left-4 rounded-full bg-[#1F2933] px-3 py-1 text-[10px] font-extrabold uppercase text-white">
                        Paling dipilih
                      </span>
                    )}
                    <span className="block text-3xl font-extrabold">
                      {support.label}
                    </span>
                    <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600">
                      {support.description}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-3xl bg-[#F6F8F7] p-4">
                <div className="mx-auto grid aspect-square max-w-[15rem] place-items-center rounded-[1.25rem] bg-white p-4 text-center">
                  {isQrVisible ? (
                    <Image
                      alt="QRIS dukungan StopMerokok"
                      className="h-full w-full rounded-2xl object-contain"
                      height={512}
                      onError={() => setIsQrVisible(false)}
                      priority
                      src="/images/gopay-qr.png"
                      width={512}
                    />
                  ) : (
                    <div>
                      <div className="mx-auto grid size-32 place-items-center rounded-3xl border-2 border-dashed border-slate-300">
                        <span className="text-sm font-extrabold">QRIS</span>
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-500">
                        File QR belum terbaca di /images/gopay-qr.png
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-sm font-bold text-slate-600">
                  Pindai dengan GoPay, OVO, DANA, ShopeePay, atau m-Banking.
                </p>
                <p className="mt-1 text-center text-xs font-semibold leading-5 text-slate-500">
                  Pilih nominal {formatRupiah(selectedSupportAmount)}, screenshot
                  QR jika perlu, lalu bayar via QRIS.
                </p>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-100 p-4">
                <p className="text-sm font-extrabold text-[#2F7D57]">
                  Transfer bank
                </p>
                <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
                  <div className="flex justify-between gap-3">
                    <span>Bank</span>
                    <span className="text-right font-extrabold text-[#1F2933]">
                      {supportBank.bankName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>No. Rekening</span>
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-[#DFF3E8] px-3 py-1 font-extrabold text-[#2F7D57]"
                      onClick={copySupportAccount}
                      type="button"
                    >
                      {supportBank.accountNumber}
                      <Copy className="size-4" />
                    </button>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Atas nama</span>
                    <span className="text-right font-extrabold text-[#1F2933]">
                      {supportBank.accountName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#DFF3E8_0%,#E3F3F7_52%,#FFFFFF_100%)] p-6 shadow-xl shadow-slate-200/70">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#2F7D57]">
                Penghematan pribadi
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                Uang yang dulu jadi asap, kini bisa punya arah.
              </h2>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-700">
                Ringkasan ini menunjukkan dampak kecil dari absen yang kamu
                isi. Angkanya bisa jadi pengingat bahwa progres punya bentuk
                nyata.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white/85 p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">
                Total uang dihemat
              </p>
              <p className="mt-2 text-5xl font-extrabold text-[#1F2933]">
                {formatRupiah(summary.savedMoney)}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Dari {summary.avoidedSticks} batang yang berhasil kamu hindari.
              </p>
              <Link
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
                href="/share"
              >
                <Images className="size-4" />
                Bagikan progress
              </Link>
            </div>
          </div>
        </div>

        {!hasSavings && (
          <EmptyState
            actionHref="/check-in"
            actionLabel="Absen hari ini"
            body="Penghematan akan dihitung otomatis setelah kamu mulai absen. Satu hari jujur mencatat sudah cukup untuk memulai."
            icon={PiggyBank}
            secondaryHref="/onboarding"
            secondaryLabel="Cek data rokok"
            title="Belum ada uang yang tercatat"
          />
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            label="Batang dihindari"
            value={`${summary.avoidedSticks} batang`}
          />
          <Metric
            label="Bungkus tidak dibeli"
            value={`${packEstimate.toFixed(1)} bungkus`}
          />
          <Metric label="Uang dihemat" value={formatRupiah(summary.savedMoney)} />
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#36798D]">
                Maknanya bisa sederhana
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Uang hemat ini kira-kira setara dengan apa?
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <ConversionCard
              label="Gelas kopi"
              value={Math.floor(summary.savedMoney / 18000)}
            />
            <ConversionCard
              label="Makan enak"
              value={Math.floor(summary.savedMoney / 35000)}
            />
            <ConversionCard
              label="Hari parkir"
              value={Math.floor(summary.savedMoney / 5000)}
            />
            <ConversionCard
              label="Tabungan"
              value={formatRupiah(summary.savedMoney)}
            />
            <ConversionCard label="Dukungan kecil" value="mulai terbentuk" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function SupportPoint({
  icon: Icon,
  text,
}: {
  icon: typeof Server;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/8 p-4 text-slate-200">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#9DE5BD]">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold leading-6">{text}</p>
    </div>
  );
}

function ConversionCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl bg-[#F6F8F7] p-4">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

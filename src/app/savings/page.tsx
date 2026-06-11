"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, HeartHandshake, Images, PiggyBank, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { loadCheckins, loadProfile } from "@/lib/client-data";
import {
  calculateSummary,
  formatRupiah,
  type DailyCheckin,
  type Profile,
} from "@/lib/mvp-store";

const supportAmounts = [
  { amount: 10000, description: "Setara satu kopi untuk bantu server tetap menyala.", label: "10rb" },
  { amount: 25000, description: "Bantu menjaga aplikasi tetap gratis untuk lebih banyak pengguna.", isPopular: true, label: "25rb" },
  { amount: 50000, description: "Dukung pengembangan fitur baru dan komunitas.", label: "50rb" },
  { amount: 100000, description: "Sponsor kecil untuk ruang berhenti merokok yang lebih sehat.", label: "100rb" },
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
        <section className="mx-auto max-w-5xl space-y-5">
          <div className="h-64 rounded-[2rem] bg-white skeleton-shimmer" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
            <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
            <div className="h-28 rounded-[1.5rem] bg-white skeleton-shimmer" />
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#10231D_0%,#123B3F_55%,#4FAE7B_150%)] p-6 text-white shadow-xl shadow-slate-300/70">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                Berbagi untuk StopMerokok
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Bantu ruang ini tetap gratis dan nyaman.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                Kamu fokus menjaga hari tanpa rokok. Dukungan kecil membantu
                server, database, domain, keamanan, dan pengembangan fitur tetap
                berjalan tanpa iklan yang mengganggu.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <SupportPoint
                  icon={ShieldCheck}
                  text="Menjaga aplikasi tetap aman dan tanpa jual data pribadi."
                />
                <SupportPoint
                  icon={Sparkles}
                  text="Membantu pengembangan fitur baru yang lebih suportif."
                />
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white p-5 text-[#1F2933] shadow-2xl shadow-black/20">
              <p className="text-sm font-extrabold uppercase text-[#2F7D57]">
                Pilih dukungan
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.82fr_1fr]">
          <section className="rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              Bayar via QRIS
            </p>
            <div className="mt-4 mx-auto grid aspect-square max-w-[17rem] place-items-center rounded-[1.5rem] bg-[#F6F8F7] p-4 text-center">
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
            <p className="mt-4 text-center text-sm font-bold text-slate-600">
              Pindai dengan GoPay, OVO, DANA, ShopeePay, atau m-Banking.
            </p>
            <p className="mt-1 text-center text-xs font-semibold leading-5 text-slate-500">
              Pilih nominal {formatRupiah(selectedSupportAmount)}, screenshot QR
              jika perlu, lalu bayar via QRIS.
            </p>
          </section>

          <section className="space-y-5">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
                  <HeartHandshake className="size-6" />
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                    Transfer bank
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold">
                    Alternatif kalau QRIS belum nyaman
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                <InfoRow label="Bank" value={supportBank.bankName} />
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F6F8F7] px-4 py-3">
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
                <InfoRow label="Atas nama" value={supportBank.accountName} />
              </div>
            </div>

            <div className="rounded-[2rem] bg-[linear-gradient(135deg,#DFF3E8_0%,#E3F3F7_60%,#FFFFFF_100%)] p-5 shadow-sm">
              <p className="text-sm font-extrabold uppercase text-[#2F7D57]">
                Penghematan pribadi
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">
                {formatRupiah(summary.savedMoney)}
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                Dari {Math.round(summary.avoidedSticks)} batang yang berhasil
                kamu hindari.
              </p>
              <Link
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
                href="/share"
              >
                <Images className="size-4" />
                Bagikan progress
              </Link>
            </div>
          </section>
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

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Batang dihindari" value={`${Math.round(summary.avoidedSticks)} batang`} />
          <Metric
            label="Uang dihemat"
            value={formatRupiah(summary.savedMoney)}
          />
          <Metric
            label="Dukungan kecil"
            value={formatRupiah(selectedSupportAmount)}
          />
        </div>
      </section>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F6F8F7] px-4 py-3">
      <span>{label}</span>
      <span className="text-right font-extrabold text-[#1F2933]">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function SupportPoint({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
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

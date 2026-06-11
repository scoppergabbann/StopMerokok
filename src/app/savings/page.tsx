"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import {
  Copy,
  HandHeart,
  PiggyBank,
  PlusCircle,
  Server,
  ShieldCheck,
} from "lucide-react";
import {
  loadCheckins,
  loadDonationAllocations,
  loadProfile,
  loadRewards,
  persistDonationAllocation,
  persistReward,
} from "@/lib/client-data";
import {
  calculateSummary,
  formatRupiah,
  formatRupiahInput,
  parseRupiahInput,
  type DailyCheckin,
  type DonationAllocation,
  type Profile,
  type Reward,
} from "@/lib/mvp-store";

const directionOptions = [
  "Simpan untuk diri sendiri",
  "Reward kecil",
  "Bantu keluarga",
  "Donasi / sedekah",
  "Tabungan masa depan",
];

const donationTargets = [
  "Anak yatim",
  "Fakir miskin",
  "Lansia",
  "Keluarga",
  "Masjid",
  "Panti asuhan",
  "Pendidikan",
  "Sedekah Jumat",
];

const asmaulHusnaAmounts = [10099, 25099, 50099, 99099];

const supportAmounts = [
  {
    amount: 10000,
    description: "Setara satu kopi untuk bantu server tetap menyala.",
    label: "10rb",
  },
  {
    amount: 25000,
    description: "Bantu menjaga aplikasi tetap gratis untuk lebih banyak user.",
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
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allocations, setAllocations] = useState<DonationAllocation[]>([]);
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const [allocationAmountInput, setAllocationAmountInput] = useState("");
  const [selectedDirection, setSelectedDirection] = useState(directionOptions[0]);
  const [selectedQrTarget, setSelectedQrTarget] = useState(donationTargets[0]);
  const [selectedQrAmount, setSelectedQrAmount] = useState(asmaulHusnaAmounts[0]);
  const [selectedSupportAmount, setSelectedSupportAmount] = useState(
    supportAmounts[1].amount,
  );
  const [isQrVisible, setIsQrVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([
        loadProfile(),
        loadCheckins(),
        loadRewards(),
        loadDonationAllocations(),
      ]).then(([nextProfile, nextCheckins, nextRewards, nextAllocations]) => {
        setProfile(nextProfile);
        setCheckins(nextCheckins);
        setRewards(nextRewards);
        setAllocations(nextAllocations);
        setIsLoading(false);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = calculateSummary(profile, checkins);
  const allocatedAmount = allocations.reduce(
    (total, allocation) => total + allocation.amount,
    0,
  );
  const availableSavings = Math.max(0, summary.savedMoney - allocatedAmount);
  const packEstimate =
    profile && profile.sticksPerPack > 0
      ? summary.avoidedSticks / profile.sticksPerPack
      : 0;
  const dailyAverageSaving =
    checkins.length > 0 ? summary.savedMoney / checkins.length : 0;
  const lastSevenCheckins = [...checkins]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const lastSevenSummary = calculateSummary(profile, lastSevenCheckins);
  const thirtyDayProjection = dailyAverageSaving * 30;
  const rewardById = useMemo(
    () => new Map(rewards.map((reward) => [reward.id, reward])),
    [rewards],
  );
  const allocationByReward = useMemo(() => {
    const map = new Map<string, number>();

    for (const allocation of allocations) {
      map.set(
        allocation.rewardId,
        (map.get(allocation.rewardId) ?? 0) + allocation.amount,
      );
    }

    return map;
  }, [allocations]);
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
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-start">
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
                    onClick={() => {
                      setSelectedSupportAmount(support.amount);
                    }}
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
                  Scan dengan GoPay, OVO, DANA, ShopeePay, atau m-Banking.
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
                Savings pribadi
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                Uang yang dulu jadi asap, kini bisa punya arah.
              </h2>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-700">
                Lihat uang yang berhasil kamu selamatkan, buat target kecil,
                lalu catat saat uang itu benar-benar kamu arahkan untuk diri
                sendiri, keluarga, tabungan, atau sedekah.
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
            </div>
          </div>
        </div>

        {!hasSavings && (
          <EmptyState
            actionHref="/check-in"
            actionLabel="Absen hari ini"
            body="Savings akan dihitung otomatis setelah kamu mulai check-in. Satu hari jujur mencatat sudah cukup untuk memulai."
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
          <Metric
            label="Masih tersedia"
            value={formatRupiah(availableSavings)}
          />
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
            <ConversionCard label="Reward pribadi" value="mulai terbentuk" />
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              Target reward
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Kamu sedang membangun sesuatu dari kebiasaan baru.
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              Buat target seperti sepatu baru, tabungan kecil, traktir
              keluarga, atau sedekah.
            </p>
          </div>

          <form
            className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const targetAmount = parseRupiahInput(targetAmountInput);

              if (targetAmount <= 0) {
                showToast({
                  message: "Isi nominal target, misalnya Rp500.000.",
                  title: "Nominal belum valid",
                  variant: "info",
                });
                return;
              }

              const nextReward: Reward = {
                category: selectedDirection,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
                targetAmount,
                title: String(form.get("title") || "Target baru"),
              };

              await persistReward(nextReward);
              setRewards((current) => [nextReward, ...current]);
              setTargetAmountInput("");
              event.currentTarget.reset();
              showToast({
                message: "Target kamu sudah ditambahkan.",
                title: "Target tersimpan",
                variant: "success",
              });
            }}
          >
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              name="title"
              placeholder="Contoh: Sedekah Jumat"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              inputMode="numeric"
              onChange={(event) =>
                setTargetAmountInput(formatRupiahInput(event.target.value))
              }
              placeholder="Rp100.000"
              required
              type="text"
              value={targetAmountInput}
            />
            <button className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white">
              Buat target
            </button>
          </form>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {rewards.length === 0 ? (
              <EmptyState
                body="Buat target kecil seperti sepatu, tabungan, traktir keluarga, atau sedekah Jumat agar savings punya arah yang terasa nyata."
                icon={PlusCircle}
                title="Target berbagi belum dibuat"
              />
            ) : (
              rewards.slice(0, 2).map((reward) => {
                const allocated = allocationByReward.get(reward.id) ?? 0;
                const progress = Math.min(
                  summary.savedMoney,
                  reward.targetAmount,
                );
                const percentage =
                  reward.targetAmount > 0
                    ? Math.min(100, (progress / reward.targetAmount) * 100)
                    : 0;
                const remaining = Math.max(0, reward.targetAmount - progress);
                const daysLeft =
                  dailyAverageSaving > 0
                    ? Math.ceil(remaining / dailyAverageSaving)
                    : null;

                return (
                  <article
                    className="rounded-[1.5rem] border border-slate-100 bg-[#F6F8F7] p-5"
                    key={reward.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#4FAE7B]">
                          {reward.category ?? "Target"}
                        </p>
                        <h3 className="mt-1 text-xl font-extrabold">
                          {reward.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#2F7D57]">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-600">
                      {formatRupiah(progress)} /{" "}
                      {formatRupiah(reward.targetAmount)}
                    </p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#4FAE7B]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      {daysLeft
                        ? `Dengan ritme sekarang, sekitar ${daysLeft} hari lagi.`
                        : "Isi beberapa check-in dulu untuk estimasi hari."}
                      {allocated > 0
                        ? ` Sudah dialokasikan ${formatRupiah(allocated)}.`
                        : ""}
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Mau diarahkan ke mana uang ini?
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Tidak ada pilihan yang paling benar. Uang yang kamu selamatkan boleh
            kembali ke dirimu, keluarga, masa depan, atau menjadi kebaikan kecil
            untuk orang lain.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {directionOptions.map((option) => (
              <button
                className={`rounded-2xl border p-4 text-left font-extrabold transition ${
                  selectedDirection === option
                    ? "border-[#4FAE7B] bg-[#DFF3E8] text-[#2F7D57]"
                    : "border-slate-100 bg-[#F6F8F7] text-slate-700"
                }`}
                key={option}
                onClick={() => setSelectedDirection(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr]">
          <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
            <p className="text-sm font-extrabold uppercase text-[#36798D]">
              Donasi / sedekah
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Kebaikan kecil juga cukup.
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              Kadang, uang yang dulu habis menjadi asap bisa berubah menjadi
              kebaikan kecil untuk orang lain. Tidak harus besar. Yang penting
              kamu tahu progressmu bisa membawa manfaat.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-sm font-bold text-slate-600">
                  Tujuan
                </span>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
                  onChange={(event) => setSelectedQrTarget(event.target.value)}
                  value={selectedQrTarget}
                >
                  {donationTargets.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold text-slate-600">
                  Nominal
                </span>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
                  onChange={(event) =>
                    setSelectedQrAmount(Number(event.target.value))
                  }
                  value={selectedQrAmount}
                >
                  {asmaulHusnaAmounts.map((amount) => (
                    <option key={amount} value={amount}>
                      {formatRupiah(amount)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="mt-4 rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
              onClick={() => {
                setAllocationAmountInput(
                  formatRupiahInput(String(selectedQrAmount)),
                );
                showToast({
                  message: `${formatRupiah(selectedQrAmount)} untuk ${selectedQrTarget} siap dicatat setelah kamu sisihkan.`,
                  title: "Nominal dipilih",
                  variant: "success",
                });
              }}
              type="button"
            >
              Sisihkan sebagian
            </button>
          </div>

          <div className="rounded-[2rem] bg-[#1F2933] p-5 text-white shadow-xl shadow-slate-300/60">
            <div className="mx-auto grid aspect-square max-w-[18rem] place-items-center rounded-[2rem] bg-white p-5 text-center text-[#1F2933]">
              {isQrVisible ? (
                <Image
                  alt="QR GoPay StopMerokok"
                  className="h-full w-full rounded-3xl object-contain"
                  height={512}
                  onError={() => setIsQrVisible(false)}
                  priority
                  src="/images/gopay-qr.png"
                  width={512}
                />
              ) : (
                <div>
                  <div className="mx-auto grid size-36 place-items-center rounded-3xl border-2 border-dashed border-slate-300 bg-[#F6F8F7]">
                    <span className="text-sm font-extrabold">QR GoPay</span>
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-600">
                    File QR belum terbaca di /images/gopay-qr.png
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 rounded-3xl bg-white/10 p-4">
              <p className="text-sm font-bold text-[#9DE5BD]">
                Tujuan dipilih
              </p>
              <p className="mt-1 text-xl font-extrabold">{selectedQrTarget}</p>
              <p className="mt-2 font-semibold text-slate-300">
                Nominal: {formatRupiah(selectedQrAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Catat alokasi</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Setelah uangnya benar-benar kamu arahkan ke target tertentu, catat
            di sini agar perjalananmu terasa terlihat.
          </p>
          <form
            className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_1fr_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const rewardId = String(form.get("rewardId") || "");
              const reward = rewards.find((item) => item.id === rewardId);
              const amount = parseRupiahInput(allocationAmountInput);

              if (!reward || amount <= 0) {
                showToast({
                  message: "Pilih target dan isi nominal alokasi.",
                  title: "Alokasi belum lengkap",
                  variant: "info",
                });
                return;
              }

              if (amount > availableSavings) {
                showToast({
                  message: "Nominal lebih besar dari savings yang tersedia.",
                  title: "Savings belum cukup",
                  variant: "info",
                });
                return;
              }

              const allocation: DonationAllocation = {
                amount,
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
                note: String(form.get("note") || ""),
                rewardId,
                title: reward.title,
              };

              await persistDonationAllocation(allocation);
              setAllocations((current) => [allocation, ...current]);
              setAllocationAmountInput("");
              event.currentTarget.reset();
              showToast({
                message: `${formatRupiah(amount)} dialokasikan ke ${reward.title}.`,
                title: "Alokasi tersimpan",
                variant: "success",
              });
            }}
          >
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
              name="rewardId"
              required
            >
              <option value="">Pilih target</option>
              {rewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.title}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              inputMode="numeric"
              onChange={(event) =>
                setAllocationAmountInput(formatRupiahInput(event.target.value))
              }
              placeholder="Rp10.000"
              required
              type="text"
              value={allocationAmountInput}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              name="note"
              placeholder="Catatan opsional"
            />
            <button className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white">
              Simpan
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] bg-[#F6F8F7] p-5">
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Insight kecil
          </p>
          <p className="mt-3 text-lg font-bold leading-8">
            Dalam 7 check-in terakhir, kamu berhasil menghemat{" "}
            {formatRupiah(lastSevenSummary.savedMoney)}.
          </p>
          <p className="mt-2 leading-7 text-slate-600">
            Kalau ritme ini konsisten selama 30 hari, kamu bisa menghemat
            sekitar {formatRupiah(thirtyDayProjection)}. Tidak perlu sempurna,
            cukup terus kembali ke kebiasaan yang sedang kamu bangun.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">
            Riwayat uang yang diarahkan
          </h2>
          <div className="mt-4 space-y-3">
            {allocations.length === 0 ? (
              <EmptyState
                body="Setelah uang benar-benar kamu sisihkan ke target tertentu, catat di sini agar perjalananmu terasa terlihat."
                icon={HandHeart}
                title="Belum ada alokasi savings"
              />
            ) : (
              allocations.map((allocation) => (
                <div
                  className="rounded-2xl bg-[#F6F8F7] p-4"
                  key={allocation.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-extrabold">{allocation.title}</p>
                      <p className="text-sm font-semibold text-slate-500">
                        {rewardById.get(allocation.rewardId)?.category ??
                          "Alokasi"}
                        {" - "}
                        {new Date(allocation.createdAt).toLocaleDateString(
                          "id-ID",
                        )}
                        {allocation.note ? ` - ${allocation.note}` : ""}
                      </p>
                    </div>
                    <p className="font-extrabold text-[#2F7D57]">
                      {formatRupiah(allocation.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
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

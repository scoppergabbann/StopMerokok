"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
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
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#DFF3E8_0%,#E3F3F7_52%,#FFFFFF_100%)] p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm font-extrabold uppercase text-[#2F7D57]">
            Uang yang dulu jadi asap
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                Uang yang Berhasil Kamu Selamatkan
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-700">
                Setiap batang yang tidak kamu hisap hari ini bukan cuma baik
                untuk tubuhmu, tapi juga menyelamatkan sedikit uang untuk hal
                yang lebih berarti.
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
          <div className="rounded-[2rem] border border-dashed border-[#BFE7D1] bg-white p-6 text-center">
            <p className="text-2xl font-extrabold">
              Belum ada uang yang tercatat, dan itu tidak apa-apa.
            </p>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Mulai dari absen hari ini dulu. Progress kecil tetap progress,
              bahkan kalau hari ini kamu baru mulai jujur mencatat.
            </p>
            <Link
              className="mt-5 inline-flex rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
              href="/check-in"
            >
              Absen hari ini
            </Link>
          </div>
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
              Buat target seperti sepatu baru, tabungan kecil, atau hadiah
              sederhana untuk diri sendiri.
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
              placeholder="Contoh: Sepatu baru"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              inputMode="numeric"
              onChange={(event) =>
                setTargetAmountInput(formatRupiahInput(event.target.value))
              }
              placeholder="Rp500.000"
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
              <div className="rounded-2xl bg-[#F6F8F7] p-4 font-semibold text-slate-600">
                Belum ada target. Kamu bisa mulai dari hal kecil yang terasa
                dekat: sepatu, baju, tabungan, atau traktir keluarga.
              </div>
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
              <p className="font-semibold text-slate-600">
                Belum ada alokasi. Nanti setiap pilihan kecil akan tercatat di
                sini.
              </p>
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

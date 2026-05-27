"use client";

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

const personalTargets = [
  "Beli sepatu",
  "Beli tas",
  "Beli baju",
  "Self reward",
  "Tabungan pribadi",
  "Traktir keluarga",
  "Kelas olahraga",
  "Liburan kecil",
];

const asmaulHusnaAmounts = [10099, 25099, 50099, 99099];

export default function SavingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [allocations, setAllocations] = useState<DonationAllocation[]>([]);
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const [allocationAmountInput, setAllocationAmountInput] = useState("");
  const [selectedQrTarget, setSelectedQrTarget] = useState(donationTargets[0]);
  const [selectedQrAmount, setSelectedQrAmount] = useState(asmaulHusnaAmounts[0]);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProfile().then(setProfile);
      loadCheckins().then(setCheckins);
      loadRewards().then(setRewards);
      loadDonationAllocations().then(setAllocations);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = calculateSummary(profile, checkins);
  const allocatedAmount = allocations.reduce(
    (total, allocation) => total + allocation.amount,
    0,
  );
  const availableSavings = Math.max(0, summary.savedMoney - allocatedAmount);
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
  const rewardById = useMemo(
    () => new Map(rewards.map((reward) => [reward.id, reward])),
    [rewards],
  );
  const donationAllocated = allocations
    .filter(
      (allocation) => rewardById.get(allocation.rewardId)?.category === "Donasi",
    )
    .reduce((total, allocation) => total + allocation.amount, 0);
  const personalAllocated = allocations
    .filter((allocation) => {
      const category = rewardById.get(allocation.rewardId)?.category;
      return Boolean(category && category !== "Donasi");
    })
    .reduce((total, allocation) => total + allocation.amount, 0);

  async function addQuickTarget(title: string, category: string) {
    const nextReward: Reward = {
      category,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      targetAmount: category === "Donasi" ? 100000 : 250000,
      title,
    };

    await persistReward(nextReward);
    setRewards((current) => [nextReward, ...current]);
    showToast({
      message: `${title} ditambahkan sebagai target ${category.toLowerCase()}.`,
      title: "Target cepat dibuat",
      variant: "success",
    });
  }

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Berbagi
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Savings jadi kebaikan</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Uang yang tidak jadi habis untuk rokok bisa kamu arahkan ke reward,
          keluarga, atau donasi yang kamu pilih sendiri.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Total dihemat" value={formatRupiah(summary.savedMoney)} />
          <Metric label="Sudah dialokasikan" value={formatRupiah(allocatedAmount)} />
          <Metric label="Masih tersedia" value={formatRupiah(availableSavings)} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] bg-[#DFF3E8] p-5 shadow-sm">
            <p className="text-sm font-extrabold uppercase text-[#2F7D57]">
              Dana tersalurkan
            </p>
            <p className="mt-2 text-4xl font-extrabold">
              {formatRupiah(donationAllocated)}
            </p>
            <p className="mt-3 leading-7 text-slate-700">
              Total savings yang dicatat untuk tujuan donasi pilihan user.
            </p>
          </div>
          <div className="rounded-[2rem] bg-[#E3F3F7] p-5 shadow-sm">
            <p className="text-sm font-extrabold uppercase text-[#36798D]">
              Untuk diri sendiri
            </p>
            <p className="mt-2 text-4xl font-extrabold">
              {formatRupiah(personalAllocated)}
            </p>
            <p className="mt-3 leading-7 text-slate-700">
              Savings yang dipakai untuk reward pribadi, keluarga, atau
              tabungan.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              Scan QR GoPay
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Transfer dengan nominal berakhiran 99
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Angka 99 dipakai sebagai pengingat Asmaul Husna. Setelah transfer,
              dana akan diarahkan ke tujuan yang user pilih dan bisa dicatat di
              riwayat alokasi.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-600">
                  Tujuan donasi
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
              <label className="block">
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
                setAllocationAmountInput(formatRupiahInput(String(selectedQrAmount)));
                showToast({
                  message: `${formatRupiah(selectedQrAmount)} untuk ${selectedQrTarget} siap dicatat setelah transfer.`,
                  title: "Nominal dipilih",
                  variant: "success",
                });
              }}
              type="button"
            >
              Pakai nominal ini
            </button>
          </div>

          <div className="rounded-[2rem] bg-[#1F2933] p-5 text-white shadow-xl shadow-slate-300/60">
            <div className="mx-auto grid aspect-square max-w-[18rem] place-items-center rounded-[2rem] bg-white p-5 text-center text-[#1F2933]">
              <div>
                <div className="mx-auto grid size-36 place-items-center rounded-3xl border-2 border-dashed border-slate-300 bg-[#F6F8F7]">
                  <span className="text-sm font-extrabold">QR GoPay</span>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-600">
                  Simpan QR asli di public/images/gopay-qr.png
                </p>
              </div>
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

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Tambah target reward/donasi</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Kamu bisa punya beberapa target sekaligus, misalnya donasi anak
            yatim dan reward pribadi kecil.
          </p>
          <form
            className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const targetAmount = parseRupiahInput(targetAmountInput);

              if (targetAmount <= 0) {
                showToast({
                  message: "Isi nominal target, misalnya Rp10.000.",
                  title: "Nominal belum valid",
                  variant: "info",
                });
                return;
              }

              const nextReward: Reward = {
                category: String(form.get("category") || "Target pribadi"),
                createdAt: new Date().toISOString(),
                id: crypto.randomUUID(),
                targetAmount,
                title: String(form.get("title") || "Target kebaikan"),
              };

              await persistReward(nextReward);
              setRewards((current) => [nextReward, ...current]);
              setTargetAmountInput("");
              event.currentTarget.reset();
              showToast({
                message: "Target baru sudah ditambahkan.",
                title: "Target tersimpan",
                variant: "success",
              });
            }}
          >
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              name="title"
              placeholder="Contoh: Donasi anak yatim"
              required
            />
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
              name="category"
            >
              <option>Donasi</option>
              <option>Reward pribadi</option>
              <option>Keluarga</option>
              <option>Tabungan</option>
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
              inputMode="numeric"
              onChange={(event) =>
                setTargetAmountInput(formatRupiahInput(event.target.value))
              }
              placeholder="Rp10.000"
              required
              type="text"
              value={targetAmountInput}
            />
            <button className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white">
              Tambah
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold">Ide untuk diri sendiri</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Berhenti merokok juga boleh dirayakan. Savings bisa diarahkan ke
              sepatu, tas, baju, tabungan, atau reward kecil lain.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {personalTargets.map((target) => (
                <button
                  className="rounded-2xl border border-slate-100 bg-[#F6F8F7] p-4 text-left font-extrabold transition hover:border-[#4FAE7B]"
                  key={target}
                  onClick={() => addQuickTarget(target, "Reward pribadi")}
                  type="button"
                >
                  {target}
                  <span className="mt-1 block text-xs font-semibold text-slate-500">
                    Buat target Rp250.000
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold">Ide donasi</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Pilih tujuan donasi cepat. Dana tersalurkan akan dihitung dari
              alokasi ke kategori Donasi.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {donationTargets.map((target) => (
                <button
                  className="rounded-2xl border border-slate-100 bg-[#F6F8F7] p-4 text-left font-extrabold transition hover:border-[#4FAE7B]"
                  key={target}
                  onClick={() => addQuickTarget(target, "Donasi")}
                  type="button"
                >
                  {target}
                  <span className="mt-1 block text-xs font-semibold text-slate-500">
                    Buat target Rp100.000
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {rewards.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="font-bold text-slate-600">
                Belum ada target. Pilih salah satu ide di bawah atau buat target
                sendiri.
              </p>
            </div>
          ) : (
            rewards.map((reward) => {
              const progress = allocationByReward.get(reward.id) ?? 0;
              const percentage =
                reward.targetAmount > 0
                  ? Math.min(100, (progress / reward.targetAmount) * 100)
                  : 0;

              return (
                <article
                  className="rounded-[2rem] bg-white p-5 shadow-sm"
                  key={reward.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#4FAE7B]">
                        {reward.category ?? "Target"}
                      </p>
                      <h2 className="mt-1 text-xl font-extrabold">
                        {reward.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#DFF3E8] px-3 py-1 text-xs font-extrabold text-[#2F7D57]">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    {formatRupiah(progress)} dari{" "}
                    {formatRupiah(reward.targetAmount)}
                  </p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4FAE7B]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Alokasikan savings</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Catat saat kamu benar-benar mengarahkan savings ke target tertentu.
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

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">
            Riwayat dana tersalurkan dan reward pribadi
          </h2>
          <div className="mt-4 space-y-3">
            {allocations.length === 0 ? (
              <p className="font-semibold text-slate-600">
                Belum ada alokasi. Nanti setiap kebaikan kecil akan tercatat di
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
                        {allocation.note ? ` · ${allocation.note}` : ""}
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {donationTargets.map((target) => (
            <button
              className="rounded-[1.5rem] border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-[#4FAE7B]"
              key={target}
              onClick={() =>
                showToast({
                  message: `${target} bisa kamu jadikan target baru.`,
                  title: "Ide berbagi dipilih",
                  variant: "info",
                })
              }
              type="button"
            >
              <p className="font-extrabold">{target}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Cocok untuk target donasi dari savings rokok.
              </p>
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

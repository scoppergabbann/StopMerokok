"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Footprints,
  Link2Off,
  MoveRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import { loadMovementLogs, persistMovementLog } from "@/lib/client-data";
import { formatDateKey, type MovementLog } from "@/lib/mvp-store";

const movementOptions: Array<{
  durationMinutes: number;
  label: string;
  type: MovementLog["type"];
  helper: string;
}> = [
  {
    durationMinutes: 5,
    helper: "Saat dorongan merokok muncul, mulai dari keluar kamar atau jalan di depan rumah.",
    label: "Jalan 5 menit",
    type: "walk_5",
  },
  {
    durationMinutes: 10,
    helper: "Cukup jalan santai. Tidak perlu cepat, yang penting tubuh bergerak.",
    label: "Jalan 10 menit",
    type: "walk_10",
  },
  {
    durationMinutes: 3,
    helper: "Tarik napas pelan, tahan sebentar, lalu buang lebih panjang.",
    label: "Napas 3 menit",
    type: "breathing",
  },
  {
    durationMinutes: 5,
    helper: "Regangkan bahu, leher, tangan, dan punggung sampai badan lebih ringan.",
    label: "Stretching",
    type: "stretch",
  },
  {
    durationMinutes: 15,
    helper: "Olahraga ringan: jalan cepat, naik turun tangga, atau gerak bebas.",
    label: "Gerak ringan",
    type: "light_workout",
  },
];

const movementLabels: Record<MovementLog["type"], string> = {
  breathing: "Napas",
  light_workout: "Gerak ringan",
  stretch: "Stretching",
  walk_10: "Jalan 10 menit",
  walk_5: "Jalan 5 menit",
};

function getMovementMessage(totalMinutes: number, count: number) {
  if (count === 0) {
    return "Saat dorongan merokok datang, coba mulai dari jalan 5 menit. Tidak perlu jauh, yang penting tubuh bergerak dulu.";
  }

  if (totalMinutes >= 90) {
    return "Minggu ini tubuhmu sudah banyak bergerak. Ini bukti kecil bahwa napas baru sedang kamu bangun.";
  }

  if (totalMinutes >= 30) {
    return "Gerak kecilmu minggu ini sudah terasa. Saat ingin merokok, tubuhmu punya jalan pulang yang lain.";
  }

  return "Awal yang bagus. Satu aktivitas ringan tetap bisa jadi pengganti dorongan merokok yang lebih sehat.";
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [selectedType, setSelectedType] =
    useState<MovementLog["type"]>("walk_5");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadMovementLogs().then((items) => {
        setLogs(items);
        setIsLoading(false);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const selectedOption =
    movementOptions.find((option) => option.type === selectedType) ??
    movementOptions[0];
  const sevenDaysAgoKey = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return formatDateKey(date);
  }, []);
  const recentLogs = useMemo(
    () =>
      logs.filter(
        (log) => formatDateKey(new Date(log.createdAt)) >= sevenDaysAgoKey,
      ),
    [logs, sevenDaysAgoKey],
  );
  const totalMinutes = recentLogs.reduce(
    (total, log) => total + log.durationMinutes,
    0,
  );
  const activeDays = new Set(
    recentLogs.map((log) => formatDateKey(new Date(log.createdAt))),
  ).size;

  async function submitMovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const log: MovementLog = {
      createdAt: new Date().toISOString(),
      durationMinutes: selectedOption.durationMinutes,
      id: crypto.randomUUID(),
      note: note.trim(),
      type: selectedOption.type,
    };

    await persistMovementLog(log);
    setLogs((current) => [log, ...current]);
    setNote("");
    showToast({
      message: "Gerak kecilmu sudah tercatat.",
      title: "Aktivitas tersimpan",
      variant: "success",
    });
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-[#1F2933] p-5 text-white shadow-xl shadow-slate-300/60 sm:p-6">
          <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
            Aktivitas
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-extrabold">
                Gerak kecil sebagai pengganti dorongan merokok.
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Catat jalan singkat, napas pelan, stretching, atau gerak ringan
                saat dorongan merokok muncul. Tidak perlu olahraga berat.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-sm font-bold text-slate-300">
                Total minggu ini
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {totalMinutes} menit
              </p>
              <p className="mt-1 text-sm font-semibold text-[#9DE5BD]">
                {activeDays} hari aktif
              </p>
            </div>
          </div>
        </div>

        <form
          className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70"
          onSubmit={submitMovement}
        >
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
              <Footprints className="size-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">Catat gerak sekarang</h2>
              <p className="mt-2 leading-7 text-slate-600">
                Pilih aktivitas kecil yang paling realistis dilakukan hari ini.
                Kalau sedang berat, pilih yang paling ringan dulu.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {movementOptions.map((option) => (
              <button
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedType === option.type
                    ? "border-[#4FAE7B] bg-[#DFF3E8]"
                    : "border-slate-100 bg-[#F6F8F7] hover:border-[#BFE7D1]"
                }`}
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                type="button"
              >
                <span className="block font-extrabold">{option.label}</span>
                <span className="mt-1 block text-sm font-semibold text-slate-500">
                  {option.durationMinutes} menit
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-3xl bg-[#F6F8F7] p-4">
            <p className="font-extrabold">{selectedOption.label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              {selectedOption.helper}
            </p>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-slate-600">
              Catatan singkat
            </span>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#4FAE7B]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Contoh: Dorongan merokok muncul setelah kopi, lalu aku jalan sebentar."
              value={note}
            />
          </label>

          <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20 sm:w-auto">
            Simpan aktivitas
            <MoveRight className="size-4" />
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Aktivitas 7 hari" value={`${recentLogs.length}x`} />
          <Metric label="Total gerak" value={`${totalMinutes} menit`} />
          <Metric label="Hari aktif" value={`${activeDays} hari`} />
        </div>

        <div className="rounded-[2rem] bg-[#E3F3F7] p-5">
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Wawasan gerak
          </p>
          <p className="mt-3 text-lg font-bold leading-8">
            {getMovementMessage(totalMinutes, recentLogs.length)}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                Riwayat aktivitas
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Gerak yang kamu pilih
              </h2>
            </div>
            <Link
              className="rounded-full bg-[#DFF3E8] px-4 py-2 text-sm font-extrabold text-[#2F7D57]"
              href="/craving"
            >
              Lagi ingin merokok?
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="h-28 animate-pulse rounded-2xl bg-[#F6F8F7]" />
            ) : logs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[#BFE7D1] bg-[#F7FBF9] p-5 text-center">
                <Footprints className="mx-auto size-9 text-[#4FAE7B]" />
                <h3 className="mt-3 text-xl font-extrabold">
                  Belum ada aktivitas
                </h3>
                <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">
                  Kalau dorongan merokok muncul, mulai dari jalan 5 menit atau napas 3
                  menit. Setelah itu catat di sini.
                </p>
              </div>
            ) : (
              logs.slice(0, 8).map((log) => (
                <article
                  className="grid gap-4 rounded-2xl bg-[#F6F8F7] p-4 sm:grid-cols-[1fr_auto]"
                  key={log.id}
                >
                  <div>
                    <p className="font-extrabold">{movementLabels[log.type]}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {new Date(log.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                      {log.note ? ` - ${log.note}` : ""}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-white px-3 py-2 text-sm font-extrabold text-[#2F7D57]">
                    {log.durationMinutes} menit
                  </span>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF4CC] text-[#9B6B00]">
                <BadgeCheck className="size-6" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold">Lencana aktivitas</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Lencana seperti Pejalan Dorongan, Napas Baru, dan 7 Hari Aktif
                  bisa dibuka dari kombinasi absen dan gerak ringan.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E3F3F7] text-[#36798D]">
                <Link2Off className="size-6" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold">Strava nanti dulu</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Integrasi otomatis dengan Strava diparkir dulu karena akses
                  pengembang berbayar. Aktivitas manual ini tetap bisa dipakai
                  gratis mulai sekarang.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
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

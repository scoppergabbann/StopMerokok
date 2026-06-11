"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Leaf, Sprout } from "lucide-react";
import type { CheckinStatus } from "@/lib/mvp-store";

type CelebrationPayload = {
  dayNumber: number;
  isComeback: boolean;
  milestone: null | {
    badge?: string;
    description: string;
    streak: number;
  };
  status: CheckinStatus;
  streak: number;
};

const fallbackPayload: CelebrationPayload = {
  dayNumber: 1,
  isComeback: false,
  milestone: null,
  status: "smoke_free",
  streak: 0,
};

function getCopy(payload: CelebrationPayload) {
  if (payload.milestone) {
    return {
      accent: "Badge baru terbuka",
      body: payload.milestone.description,
      title: payload.milestone.badge ?? "Milestone baru",
      tone: "milestone" as const,
    };
  }

  if (payload.isComeback) {
    return {
      accent: "Kamu mulai lagi hari ini",
      body: "Mulai lagi bukan gagal. Itu tanda kamu belum menyerah.",
      title: "Langkah baru tercatat",
      tone: "comeback" as const,
    };
  }

  if (payload.status === "smoke_free") {
    return {
      accent: `Hari ke-${payload.dayNumber} tercatat 🌱`,
      body: "Kamu berhasil melewati hari ini tanpa rokok. Satu hari lagi, satu napas lebih lega.",
      title: "Bebas rokok hari ini",
      tone: "smoke_free" as const,
    };
  }

  if (payload.status === "reduced") {
    return {
      accent: `Hari ke-${payload.dayNumber} tercatat 🌿`,
      body: "Kamu belum harus sempurna. Mengurangi tetap progress.",
      title: "Progress tetap berjalan",
      tone: "reduced" as const,
    };
  }

  return {
    accent: `Hari ke-${payload.dayNumber} tercatat 🤍`,
    body: "Hari ini mungkin berat. Tapi kamu tetap hadir, dan itu tetap langkah maju.",
    title: "Kamu tetap hadir",
    tone: "relapsed" as const,
  };
}

export default function CheckInCelebrationPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [payload] = useState<CelebrationPayload>(() => {
    if (typeof window === "undefined") {
      return fallbackPayload;
    }

    const raw = window.sessionStorage.getItem("stopmerokok.celebration");

    if (!raw) {
      return fallbackPayload;
    }

    try {
      return JSON.parse(raw) as CelebrationPayload;
    } catch {
      return fallbackPayload;
    }
  });

  const copy = useMemo(() => getCopy(payload), [payload]);

  function goToDashboard() {
    window.sessionStorage.removeItem("stopmerokok.celebration");
    router.push("/dashboard");
  }

  function goBack() {
    window.sessionStorage.removeItem("stopmerokok.celebration");
    router.back();
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[linear-gradient(145deg,#F7FBF9_0%,#EEF8F5_48%,#F7FBFF_100%)] px-5 py-8 text-[#1F2933]">
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: ["-8%", "8%", "-4%"] }}
        className="pointer-events-none absolute inset-x-[-20%] top-24 h-44 rounded-full bg-[linear-gradient(90deg,transparent,rgba(66,169,232,0.22),rgba(79,174,123,0.18),transparent)] blur-3xl"
        transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
      />

      <AnimatePresence>
        {copy.tone === "milestone" && !reduceMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {Array.from({ length: 12 }).map((_, index) => (
              <motion.span
                animate={{
                  opacity: [0, 0.7, 0],
                  y: [0, 70 + index * 2],
                }}
                className="absolute size-2 rounded-full bg-[#9DE5BD]"
                initial={{ opacity: 0, x: 0, y: 0 }}
                key={index}
                style={{
                  left: `${12 + index * 7}%`,
                  top: `${14 + (index % 4) * 8}%`,
                }}
                transition={{ delay: index * 0.08, duration: 2.2 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-center">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/80 bg-white/90 p-6 text-center shadow-[0_28px_90px_rgba(31,41,51,0.12)] backdrop-blur"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="mx-auto grid size-28 place-items-center">
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [0.94, 1.03, 1],
                    }
              }
              className="relative grid size-24 place-items-center rounded-full bg-[#DFF3E8]"
              transition={{ duration: 1.6, ease: "easeInOut" }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-2 rounded-full border-4 border-[#4FAE7B]"
                initial={{ rotate: -90, scale: 0.82, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
              <motion.div
                animate={reduceMotion ? undefined : { y: [10, 0], opacity: [0, 1] }}
                transition={{ duration: 0.8, delay: 0.15 }}
              >
                {copy.tone === "relapsed" ? (
                  <Leaf className="size-10 text-[#36798D]" />
                ) : (
                  <Sprout className="size-10 text-[#2F7D57]" />
                )}
              </motion.div>
            </motion.div>
          </div>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm font-extrabold uppercase tracking-[0.12em] text-[#4FAE7B]"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            {copy.accent}
          </motion.p>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-3xl font-extrabold leading-tight text-[#132238]"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.25, duration: 0.35 }}
          >
            {copy.title}
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 leading-7 text-slate-600"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.35, duration: 0.35 }}
          >
            {copy.body}
          </motion.p>

          {payload.streak ? (
            <div className="mt-5 rounded-3xl bg-[#F6F8F7] p-4">
              <p className="text-sm font-bold text-slate-500">Streak aktif</p>
              <p className="mt-1 text-2xl font-extrabold">
                {payload.streak} hari
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
              onClick={goToDashboard}
              type="button"
            >
              Lanjut ke dashboard
              <ArrowRight className="size-4" />
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-slate-500"
              onClick={goBack}
              type="button"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

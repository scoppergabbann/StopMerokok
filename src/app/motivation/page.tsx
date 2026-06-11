"use client";

import { Droplets, HeartHandshake, TimerReset, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { loadProfile } from "@/lib/client-data";
import { type Profile } from "@/lib/mvp-store";

const contents = [
  {
    icon: Wind,
    title: "Dorongan merokok itu seperti ombak",
    body: "Biasanya naik, terasa kuat, lalu turun. Tahan 5 menit dulu, pelan-pelan.",
  },
  {
    icon: TimerReset,
    title: "Menang satu momen",
    body: "Kamu tidak perlu menang seharian sekaligus. Lewati satu momen ingin merokok dulu.",
  },
  {
    icon: Droplets,
    title: "Ganti ritual kecil",
    body: "Minum air, jalan sebentar, cuci muka, atau tarik napas dalam sebelum mengambil keputusan.",
  },
  {
    icon: HeartHandshake,
    title: "Mulai lagi tetap progres",
    body: "Kambuh bukan akhir. Yang penting kamu sadar, mencatat, dan mau kembali mencoba.",
  },
];

export default function MotivationPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProfile().then(setProfile);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Motivasi
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Motivasi pendek</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Konten singkat untuk dibaca saat butuh dorongan kecil.
        </p>

        <div className="mt-6 rounded-[2rem] bg-[#E3F3F7] p-5">
          <p className="text-sm font-extrabold text-[#36798D]">
            Alasan saya berhenti
          </p>
          <p className="mt-3 text-xl font-extrabold leading-8">
            {profile?.reasons?.length
              ? profile.reasons.join(", ")
              : "Kesehatan, keluarga, dan hidup yang lebih lega."}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {contents.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="rounded-[2rem] bg-white p-5 shadow-sm"
                key={item.title}
              >
                <Icon className="size-7 text-[#4FAE7B]" />
                <h2 className="mt-4 text-xl font-extrabold">{item.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

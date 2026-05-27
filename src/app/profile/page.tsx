"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { readProfile, targetLabels, type Profile } from "@/lib/mvp-store";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setProfile(readProfile());
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Profile
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Profil perjalanan</h1>

        <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          {!profile ? (
            <>
              <p className="font-bold text-slate-600">
                Data profil belum tersedia.
              </p>
              <Link
                className="mt-4 inline-flex rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
                href="/onboarding"
              >
                Isi onboarding
              </Link>
            </>
          ) : (
            <div className="space-y-4">
              <Info label="Nama" value={profile.name} />
              <Info
                label="Baseline"
                value={`${profile.smokingBaselinePerDay} batang per hari`}
              />
              <Info label="Harga bungkus" value={`Rp${profile.packPrice}`} />
              <Info
                label="Batang per bungkus"
                value={`${profile.sticksPerPack} batang`}
              />
              <Info label="Target" value={targetLabels[profile.targetType]} />
              <Info
                label="Alasan saya berhenti"
                value={profile.reasons.join(", ") || "Belum diisi"}
              />
              <Link
                className="inline-flex rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
                href="/onboarding"
              >
                Edit data awal
              </Link>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F8F7] p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}

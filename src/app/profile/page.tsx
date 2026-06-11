"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { UserRound } from "lucide-react";
import { loadProfile, persistProfile } from "@/lib/client-data";
import {
  formatRupiahInput,
  parseRupiahInput,
  targetLabels,
  type Profile,
  type TargetType,
} from "@/lib/mvp-store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const reasons = [
  "Kesehatan",
  "Keluarga",
  "Finansial",
  "Ibadah / spiritual",
  "Pasangan",
  "Anak",
  "Lainnya",
];

const targets: { label: string; value: TargetType }[] = [
  { label: "Berhenti total", value: "quit_total" },
  { label: "Mengurangi perlahan", value: "reduce_slowly" },
  { label: "Coba 7 hari tanpa rokok", value: "seven_days" },
  { label: "Coba 30 hari tanpa rokok", value: "thirty_days" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [packPriceInput, setPackPriceInput] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProfile().then((nextProfile) => {
        setProfile(nextProfile);
        setPackPriceInput(
          nextProfile ? formatRupiahInput(String(nextProfile.packPrice)) : "",
        );
      });
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
            <EmptyState
              actionHref="/onboarding"
              actionLabel="Isi onboarding"
              body="Lengkapi data dasar dulu agar savings, target, dan insight harian bisa dihitung sesuai kebiasaanmu."
              icon={UserRound}
              title="Profil perjalanan belum lengkap"
            />
          ) : (
            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const nextProfile: Profile = {
                  age: Number(form.get("age") || 0) || undefined,
                  cigaretteBrand: String(form.get("cigaretteBrand") || ""),
                  createdAt: profile.createdAt,
                  name: String(form.get("name") || "Teman"),
                  packPrice: parseRupiahInput(packPriceInput),
                  reasons: form.getAll("reasons").map(String),
                  smokingBaselinePerDay: Number(form.get("baseline") || 0),
                  smokingStartedAge:
                    Number(form.get("smokingStartedAge") || 0) || undefined,
                  smokingStartedYear:
                    Number(form.get("smokingStartedYear") || 0) || undefined,
                  sticksPerPack: Number(form.get("sticksPerPack") || 20),
                  targetType: String(form.get("targetType")) as TargetType,
                  todaySmokedCount:
                    Number(form.get("todaySmokedCount") || 0) || undefined,
                };

                await persistProfile(nextProfile);
                setProfile(nextProfile);
                showToast({
                  message: "Profil perjalanan kamu sudah diperbarui.",
                  title: "Profile tersimpan",
                  variant: "success",
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-slate-600">
                    Nama panggilan
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.name}
                    name="name"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Umur
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.age}
                    min={18}
                    name="age"
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Produk rokok yang sering dipakai
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.cigaretteBrand}
                    name="cigaretteBrand"
                    placeholder="Contoh: Sampoerna"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Baseline rokok per hari
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.smokingBaselinePerDay}
                    min={0}
                    name="baseline"
                    required
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Harga satu bungkus
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    inputMode="numeric"
                    onChange={(event) =>
                      setPackPriceInput(formatRupiahInput(event.target.value))
                    }
                    required
                    type="text"
                    value={packPriceInput}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Hari ini merokok berapa batang
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.todaySmokedCount}
                    min={0}
                    name="todaySmokedCount"
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Mulai merokok umur
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.smokingStartedAge}
                    min={0}
                    name="smokingStartedAge"
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Mulai merokok tahun
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.smokingStartedYear}
                    min={1900}
                    name="smokingStartedYear"
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Batang per bungkus
                  </span>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.sticksPerPack}
                    min={1}
                    name="sticksPerPack"
                    required
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">
                    Target berhenti
                  </span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
                    defaultValue={profile.targetType}
                    name="targetType"
                  >
                    {targets.map((target) => (
                      <option key={target.value} value={target.value}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset>
                <legend className="text-sm font-bold text-slate-600">
                  Alasan saya berhenti
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {reasons.map((reason) => (
                    <label
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 font-semibold"
                      key={reason}
                    >
                      <input
                        className="size-4 accent-[#4FAE7B]"
                        defaultChecked={profile.reasons.includes(reason)}
                        name="reasons"
                        type="checkbox"
                        value={reason}
                      />
                      {reason}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="rounded-2xl bg-[#F6F8F7] p-4">
                <p className="text-sm font-bold text-slate-500">
                  Target aktif
                </p>
                <p className="mt-1 font-extrabold">
                  {targetLabels[profile.targetType]}
                </p>
              </div>

              <button className="inline-flex rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white">
                Simpan perubahan
              </button>
              <button
                className="ml-0 inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700 sm:ml-3"
                onClick={async () => {
                  if (isSupabaseConfigured && supabase) {
                    await supabase.auth.signOut();
                  }

                  showToast({
                    message: "Kamu keluar dari sesi saat ini.",
                    title: "Logout berhasil",
                    variant: "success",
                  });
                  window.setTimeout(() => router.push("/"), 400);
                }}
                type="button"
              >
                Logout
              </button>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}

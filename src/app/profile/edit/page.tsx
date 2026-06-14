"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CigaretteBrandInput } from "@/components/cigarette-brand-input";
import { EmptyState } from "@/components/empty-state";
import { SelectField } from "@/components/select-field";
import { useToast } from "@/components/toast-provider";
import { loadProfile, persistProfile } from "@/lib/client-data";
import {
  formatRupiahInput,
  getCigaretteBrandText,
  parseCigaretteBrands,
  parseRupiahInput,
  type Profile,
  type TargetType,
} from "@/lib/mvp-store";

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

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cigaretteBrandInput, setCigaretteBrandInput] = useState("");
  const [packPriceInput, setPackPriceInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadProfile().then((nextProfile) => {
        setProfile(nextProfile);
        setCigaretteBrandInput(
          nextProfile ? getCigaretteBrandText(nextProfile) : "",
        );
        setPackPriceInput(
          nextProfile ? formatRupiahInput(String(nextProfile.packPrice)) : "",
        );
        setIsLoading(false);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <section className="space-y-5">
          <div className="h-32 rounded-[2rem] bg-white skeleton-shimmer" />
          <div className="h-80 rounded-[2rem] bg-white skeleton-shimmer" />
        </section>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Isi data awal"
          body="Lengkapi profil dasar dulu sebelum mengubah data perjalanan."
          icon={UserRound}
          title="Profil belum tersedia"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              Edit profil
            </p>
            <h1 className="mt-2 text-4xl font-extrabold">Ubah data perjalanan</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Perbarui secukupnya. Data ini dipakai untuk menghitung target,
              penghematan, dan konteks perjalananmu.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700 shadow-sm"
            href="/profile"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const cigaretteBrands = parseCigaretteBrands(cigaretteBrandInput);
            const nextProfile: Profile = {
              age: Number(form.get("age") || 0) || undefined,
              cigaretteBrand: cigaretteBrands.join(", "),
              cigaretteBrands,
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

            if (!nextProfile.name.trim()) {
              showToast({
                message: "Nama panggilan wajib diisi.",
                title: "Data belum lengkap",
                variant: "info",
              });
              return;
            }

            if (nextProfile.smokingBaselinePerDay < 0 || nextProfile.packPrice <= 0) {
              showToast({
                message: "Baseline dan harga bungkus perlu diisi dengan benar.",
                title: "Data kebiasaan belum lengkap",
                variant: "info",
              });
              return;
            }

            if (nextProfile.reasons.length === 0) {
              showToast({
                message: "Pilih minimal satu alasan berhenti.",
                title: "Alasan belum dipilih",
                variant: "info",
              });
              return;
            }

            await persistProfile(nextProfile);
            showToast({
              message: "Profil perjalanan kamu sudah diperbarui.",
              title: "Profil tersimpan",
              variant: "success",
            });
            router.push("/profile");
          }}
        >
          <FormSection
            description="Data dasar ini membuat aplikasi terasa lebih personal."
            title="Data pribadi"
          >
            <Field label="Nama panggilan" className="sm:col-span-2">
              <input
                className="input"
                defaultValue={profile.name}
                name="name"
                required
              />
            </Field>
            <Field label="Umur">
              <input
                className="input"
                defaultValue={profile.age}
                min={18}
                name="age"
                type="number"
              />
            </Field>
          </FormSection>

          <FormSection
            description="Bukan untuk menghakimi. Ini hanya titik awal agar progres bisa diukur."
            title="Kebiasaan rokok"
          >
            <Field label="Produk rokok yang sering dipakai" className="sm:col-span-2">
              <CigaretteBrandInput
                onChange={setCigaretteBrandInput}
                value={cigaretteBrandInput}
              />
            </Field>
            <Field label="Baseline rokok per hari">
              <input
                className="input"
                defaultValue={profile.smokingBaselinePerDay}
                min={0}
                name="baseline"
                required
                type="number"
              />
            </Field>
            <Field label="Hari ini biasanya berapa batang">
              <input
                className="input"
                defaultValue={profile.todaySmokedCount}
                min={0}
                name="todaySmokedCount"
                type="number"
              />
            </Field>
            <Field label="Harga satu bungkus">
              <input
                className="input"
                inputMode="numeric"
                onChange={(event) =>
                  setPackPriceInput(formatRupiahInput(event.target.value))
                }
                required
                type="text"
                value={packPriceInput}
              />
            </Field>
            <Field label="Batang per bungkus">
              <input
                className="input"
                defaultValue={profile.sticksPerPack}
                min={1}
                name="sticksPerPack"
                required
                type="number"
              />
            </Field>
            <Field label="Mulai merokok umur">
              <input
                className="input"
                defaultValue={profile.smokingStartedAge}
                min={0}
                name="smokingStartedAge"
                type="number"
              />
            </Field>
            <Field label="Mulai merokok tahun">
              <input
                className="input"
                defaultValue={profile.smokingStartedYear}
                min={1900}
                name="smokingStartedYear"
                type="number"
              />
            </Field>
          </FormSection>

          <FormSection
            description="Pilih arah yang terasa realistis untuk fase hidupmu sekarang."
            title="Target"
          >
            <Field label="Target berhenti" className="sm:col-span-2">
              <SelectField
                defaultValue={profile.targetType}
                name="targetType"
                options={targets}
              />
            </Field>
          </FormSection>

          <FormSection
            description="Alasan ini akan jadi pengingat saat hari terasa berat."
            title="Alasan berhenti"
          >
            <fieldset className="sm:col-span-2">
              <legend className="sr-only">Alasan saya berhenti</legend>
              <div className="grid gap-3 sm:grid-cols-2">
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
          </FormSection>

          <FormSection
            description="Preferensi lanjutan akan dipakai untuk komunitas dan privasi."
            title="Preferensi"
          >
            <PreferencePreview label="Mode anonim komunitas" value="Nama panggilan" />
            <PreferencePreview label="Tampilkan progress ke komunitas" value="Rentetan aktif" />
            <PreferencePreview label="Bahasa" value="Indonesia" />
          </FormSection>

          <div className="sticky bottom-24 z-10 flex flex-col gap-3 rounded-[2rem] border border-slate-100 bg-white/95 p-4 shadow-2xl shadow-slate-300/60 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            <Link
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center font-extrabold text-slate-700"
              href="/profile"
            >
              Batal
            </Link>
            <button className="btn-brand-primary">
              <Save className="size-4" />
              Simpan perubahan
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{description}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function PreferencePreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F8F7] p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}

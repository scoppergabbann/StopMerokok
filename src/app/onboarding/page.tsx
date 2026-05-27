"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { persistProfile } from "@/lib/client-data";
import { type TargetType } from "@/lib/mvp-store";

const reasons = [
  "Kesehatan",
  "Keluarga",
  "Finansial",
  "Ibadah / spiritual",
  "Pasangan",
  "Anak",
  "Lainnya",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <main className="min-h-screen bg-[#F6F8F7] px-5 py-8 text-[#1F2933]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Onboarding
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Biar StopMerokok bisa menghitung progress kamu.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Isi sebentar saja. Data ini dipakai untuk menghitung streak,
            rokok yang dihindari, dan uang yang berhasil kamu hemat.
          </p>
        </div>

        <form
          className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);

            await persistProfile({
              createdAt: new Date().toISOString(),
              name: String(form.get("name") || "Teman"),
              packPrice: Number(form.get("packPrice") || 0),
              reasons: form.getAll("reasons").map(String),
              smokingBaselinePerDay: Number(form.get("baseline") || 0),
              sticksPerPack: Number(form.get("sticksPerPack") || 20),
              targetType: String(form.get("targetType")) as TargetType,
            });

            showToast({
              message: "Data awal kamu sudah tersimpan.",
              title: "Onboarding selesai",
              variant: "success",
            });
            window.setTimeout(() => router.push("/dashboard"), 450);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">
                Nama panggilan
              </span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                name="name"
                placeholder="Contoh: Fawwaz"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">
                Rata-rata rokok per hari
              </span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                min={0}
                name="baseline"
                placeholder="12"
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
                min={0}
                name="packPrice"
                placeholder="35000"
                required
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">
                Batang per bungkus
              </span>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
                min={1}
                name="sticksPerPack"
                placeholder="20"
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
                defaultValue="thirty_days"
                name="targetType"
              >
                <option value="quit_total">Berhenti total</option>
                <option value="reduce_slowly">Mengurangi perlahan</option>
                <option value="seven_days">Coba 7 hari tanpa rokok</option>
                <option value="thirty_days">Coba 30 hari tanpa rokok</option>
              </select>
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-slate-600">
              Alasan ingin berhenti
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {reasons.map((reason) => (
                <label
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 font-semibold"
                  key={reason}
                >
                  <input
                    className="size-4 accent-[#4FAE7B]"
                    name="reasons"
                    type="checkbox"
                    value={reason}
                  />
                  {reason}
                </label>
              ))}
            </div>
          </fieldset>

          <button className="mt-6 w-full rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20">
            Simpan dan masuk dashboard
          </button>
        </form>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { persistProfile } from "@/lib/client-data";
import {
  formatRupiahInput,
  parseRupiahInput,
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

const steps = [
  {
    eyebrow: "Langkah 1 dari 3",
    title: "Kenalan dulu, pelan-pelan.",
    description:
      "StopMerokok akan memakai data dasar ini untuk membuat sapaan, statistik, dan reminder yang terasa personal.",
  },
  {
    eyebrow: "Langkah 2 dari 3",
    title: "Beri kami gambaran kebiasaanmu.",
    description:
      "Tidak ada jawaban buruk. Data ini membantu menghitung rokok yang dihindari dan uang yang berhasil kamu hemat.",
  },
  {
    eyebrow: "Langkah 3 dari 3",
    title: "Tentukan arah perjalananmu.",
    description:
      "Pilih target dan alasan berhenti supaya dashboard bisa mengingatkan hal yang benar-benar penting buatmu.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [packPriceInput, setPackPriceInput] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    age: "",
    baseline: "",
    cigaretteBrand: "",
    name: "",
    smokingStartedAge: "",
    smokingStartedYear: "",
    sticksPerPack: "20",
    targetType: "thirty_days",
    todaySmokedCount: "",
  });
  const router = useRouter();
  const { showToast } = useToast();
  const currentStep = steps[step];

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateStep() {
    if (step === 0 && (!formData.name || Number(formData.age) < 18)) {
      showToast({
        message: "Isi nama panggilan dan umur minimal 18 tahun.",
        title: "Data belum lengkap",
        variant: "info",
      });
      return false;
    }

    if (
      step === 1 &&
      (!formData.cigaretteBrand ||
        Number(formData.baseline) < 0 ||
        parseRupiahInput(packPriceInput) <= 0 ||
        Number(formData.sticksPerPack) <= 0)
    ) {
      showToast({
        message: "Lengkapi produk rokok, baseline, harga, dan isi bungkus.",
        title: "Data kebiasaan belum lengkap",
        variant: "info",
      });
      return false;
    }

    if (step === 2 && selectedReasons.length === 0) {
      showToast({
        message: "Pilih minimal satu alasan agar motivasinya lebih personal.",
        title: "Alasan belum dipilih",
        variant: "info",
      });
      return false;
    }

    return true;
  }

  async function finishOnboarding() {
    if (!validateStep()) {
      return;
    }

    await persistProfile({
      age: Number(formData.age),
      cigaretteBrand: formData.cigaretteBrand,
      createdAt: new Date().toISOString(),
      name: formData.name || "Teman",
      packPrice: parseRupiahInput(packPriceInput),
      reasons: selectedReasons,
      smokingBaselinePerDay: Number(formData.baseline || 0),
      smokingStartedAge: formData.smokingStartedAge
        ? Number(formData.smokingStartedAge)
        : undefined,
      smokingStartedYear: formData.smokingStartedYear
        ? Number(formData.smokingStartedYear)
        : undefined,
      sticksPerPack: Number(formData.sticksPerPack || 20),
      targetType: formData.targetType as TargetType,
      todaySmokedCount: Number(formData.todaySmokedCount || 0),
    });

    showToast({
      message: "Data awal kamu sudah tersimpan. Kita mulai dari dashboard.",
      title: "Onboarding selesai",
      variant: "success",
    });
    window.setTimeout(() => router.push("/dashboard"), 450);
  }

  return (
    <main className="min-h-screen bg-[#F6F8F7] px-5 py-8 text-[#1F2933]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="rounded-[2rem] bg-[#1F2933] p-6 text-white shadow-2xl shadow-slate-300/60">
          <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
            StopMerokok PWA
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">
            Setup singkat sebelum kamu mulai check-in.
          </h1>
          <p className="mt-4 leading-7 text-slate-300">
            Tiga layar ini membantu app mengenal pola awalmu: siapa kamu, rokok
            apa yang biasa dipakai, dan kenapa kamu ingin berubah.
          </p>
          <div className="mt-8 grid gap-3">
            {steps.map((item, index) => (
              <div
                className={`rounded-2xl p-4 ${
                  index === step ? "bg-[#4FAE7B]" : "bg-white/10"
                }`}
                key={item.title}
              >
                <p className="text-xs font-extrabold uppercase">
                  {item.eyebrow}
                </p>
                <p className="mt-1 font-extrabold">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
                {currentStep.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">
                {currentStep.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {currentStep.description}
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              {steps.map((item, index) => (
                <span
                  className={`h-2 w-10 rounded-full ${
                    index <= step ? "bg-[#4FAE7B]" : "bg-slate-200"
                  }`}
                  key={item.eyebrow}
                />
              ))}
            </div>
          </div>

          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama panggilan" className="sm:col-span-2">
                <input
                  className="input"
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Contoh: Fawwaz"
                  value={formData.name}
                />
              </Field>
              <Field label="Umur">
                <input
                  className="input"
                  inputMode="numeric"
                  min={18}
                  onChange={(event) => updateField("age", event.target.value)}
                  placeholder="Contoh: 24"
                  type="number"
                  value={formData.age}
                />
              </Field>
              <Field label="Mulai merokok umur berapa?">
                <input
                  className="input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) =>
                    updateField("smokingStartedAge", event.target.value)
                  }
                  placeholder="Contoh: 17"
                  type="number"
                  value={formData.smokingStartedAge}
                />
              </Field>
              <Field label="Atau mulai tahun berapa?">
                <input
                  className="input"
                  inputMode="numeric"
                  min={1900}
                  onChange={(event) =>
                    updateField("smokingStartedYear", event.target.value)
                  }
                  placeholder="Contoh: 2018"
                  type="number"
                  value={formData.smokingStartedYear}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Produk rokok yang sering dipakai" className="sm:col-span-2">
                <input
                  className="input"
                  onChange={(event) =>
                    updateField("cigaretteBrand", event.target.value)
                  }
                  placeholder="Contoh: Sampoerna, Gudang Garam, Marlboro"
                  value={formData.cigaretteBrand}
                />
              </Field>
              <Field label="Rata-rata rokok per hari">
                <input
                  className="input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) =>
                    updateField("baseline", event.target.value)
                  }
                  placeholder="Contoh: 12"
                  type="number"
                  value={formData.baseline}
                />
              </Field>
              <Field label="Hari ini sudah merokok berapa batang?">
                <input
                  className="input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) =>
                    updateField("todaySmokedCount", event.target.value)
                  }
                  placeholder="Contoh: 5"
                  type="number"
                  value={formData.todaySmokedCount}
                />
              </Field>
              <Field label="Harga satu bungkus">
                <input
                  className="input"
                  inputMode="numeric"
                  onChange={(event) =>
                    setPackPriceInput(formatRupiahInput(event.target.value))
                  }
                  placeholder="Rp35.000"
                  value={packPriceInput}
                />
              </Field>
              <Field label="Isi batang per bungkus">
                <input
                  className="input"
                  inputMode="numeric"
                  min={1}
                  onChange={(event) =>
                    updateField("sticksPerPack", event.target.value)
                  }
                  placeholder="20"
                  type="number"
                  value={formData.sticksPerPack}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Field label="Target berhenti">
                <select
                  className="input bg-white"
                  onChange={(event) =>
                    updateField("targetType", event.target.value)
                  }
                  value={formData.targetType}
                >
                  <option value="quit_total">Berhenti total</option>
                  <option value="reduce_slowly">Mengurangi perlahan</option>
                  <option value="seven_days">Coba 7 hari tanpa rokok</option>
                  <option value="thirty_days">Coba 30 hari tanpa rokok</option>
                </select>
              </Field>

              <fieldset>
                <legend className="text-sm font-bold text-slate-600">
                  Alasan ingin berhenti
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {reasons.map((reason) => (
                    <label
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 font-semibold ${
                        selectedReasons.includes(reason)
                          ? "border-[#4FAE7B] bg-[#DFF3E8]"
                          : "border-slate-200"
                      }`}
                      key={reason}
                    >
                      <input
                        checked={selectedReasons.includes(reason)}
                        className="size-4 accent-[#4FAE7B]"
                        onChange={(event) => {
                          setSelectedReasons((current) =>
                            event.target.checked
                              ? [...current, reason]
                              : current.filter((item) => item !== reason),
                          );
                        }}
                        type="checkbox"
                      />
                      {reason}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700 disabled:opacity-40"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              Kembali
            </button>
            {step < 2 ? (
              <button
                className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
                onClick={() => {
                  if (validateStep()) {
                    setStep((current) => current + 1);
                  }
                }}
                type="button"
              >
                Lanjut
              </button>
            ) : (
              <button
                className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
                onClick={finishOnboarding}
                type="button"
              >
                Simpan dan masuk dashboard
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
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

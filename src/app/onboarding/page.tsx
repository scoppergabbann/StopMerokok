"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { CigaretteBrandInput } from "@/components/cigarette-brand-input";
import { SelectField } from "@/components/select-field";
import { useToast } from "@/components/toast-provider";
import { persistProfile } from "@/lib/client-data";
import {
  formatRupiahInput,
  parseCigaretteBrands,
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

const targetOptions = [
  { label: "Berhenti total", value: "quit_total" },
  { label: "Mengurangi perlahan", value: "reduce_slowly" },
  { label: "Coba 7 hari tanpa rokok", value: "seven_days" },
  { label: "Coba 30 hari tanpa rokok", value: "thirty_days" },
];

const steps = [
  {
    eyebrow: "Langkah 1 dari 3",
    title: "Kenalan singkat dulu.",
    description:
      "Cukup nama panggilan dan umur agar sapaan terasa lebih personal.",
  },
  {
    eyebrow: "Langkah 2 dari 3",
    title: "Titik awal kebiasaanmu.",
    description:
      "Bukan untuk menghakimi. Ini hanya dasar untuk menghitung progress dan penghematan.",
  },
  {
    eyebrow: "Langkah 3 dari 3",
    title: "Pilih arah yang realistis.",
    description:
      "Target dan alasanmu akan jadi pegangan saat hari terasa berat.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
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

    const cigaretteBrands = parseCigaretteBrands(formData.cigaretteBrand);

    await persistProfile({
      age: Number(formData.age),
      cigaretteBrand: cigaretteBrands.join(", "),
      cigaretteBrands,
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
      message: "Data awal kamu sudah tersimpan. Kita mulai dari beranda.",
      title: "Data awal selesai",
      variant: "success",
    });
    window.setTimeout(() => router.push("/dashboard"), 450);
  }

  return (
    <main className="min-h-screen bg-[#F6F8F7] px-5 py-6 text-[#1F2933] sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl gap-5 lg:grid-cols-[0.72fr_1fr] lg:items-center">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-5 text-white shadow-xl shadow-slate-300/60 sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-extrabold uppercase text-[#B8F1CE]">
            <Leaf className="size-4" />
            StopMerokok
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight">
            Siapkan perjalananmu dalam 3 langkah ringan.
          </h1>
          <p className="mt-4 leading-7 text-slate-200">
            Isi secukupnya dulu. Detail bisa kamu ubah lagi nanti dari profil.
          </p>
          <div className="mt-6 grid gap-3">
            {steps.map((item, index) => (
              <div
                className={`rounded-2xl border p-4 ${
                  index === step
                    ? "border-white/40 bg-white/15"
                    : index < step
                      ? "border-[#9DE5BD]/50 bg-white/10"
                      : "border-white/10 bg-white/5"
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MiniNote
              icon={ShieldCheck}
              text="Data ini dipakai untuk menghitung progress, bukan menghakimi."
            />
            <MiniNote
              icon={Sparkles}
              text="Mulai dari yang kamu ingat. Tidak harus sempurna."
            />
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-6">
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
              <OptionalPanel
                isOpen={isOptionalOpen}
                onToggle={() => setIsOptionalOpen((current) => !current)}
                title="Detail opsional"
              >
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
              </OptionalPanel>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Produk rokok yang sering dipakai" className="sm:col-span-2">
                <CigaretteBrandInput
                  onChange={(value) => updateField("cigaretteBrand", value)}
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
              <OptionalPanel
                isOpen={isOptionalOpen}
                onToggle={() => setIsOptionalOpen((current) => !current)}
                title="Detail hari ini"
              >
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
              </OptionalPanel>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Field label="Target berhenti">
                <SelectField
                  name="targetType"
                  onValueChange={(nextValue) =>
                    updateField("targetType", nextValue)
                  }
                  options={targetOptions}
                  value={formData.targetType}
                />
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
                className="btn-brand-secondary disabled:opacity-40"
                disabled={step === 0}
              onClick={() => {
                setIsOptionalOpen(false);
                setStep((current) => Math.max(0, current - 1));
              }}
              type="button"
            >
              Kembali
            </button>
            {step < 2 ? (
              <button
                className="btn-brand-primary"
                onClick={() => {
                  if (validateStep()) {
                    setIsOptionalOpen(false);
                    setStep((current) => current + 1);
                  }
                }}
                type="button"
              >
                Lanjut
              </button>
            ) : (
              <button
                className="btn-brand-primary"
                onClick={finishOnboarding}
                type="button"
              >
                Simpan dan masuk beranda
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

function OptionalPanel({
  children,
  isOpen,
  onToggle,
  title,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
}) {
  return (
    <div className="sm:col-span-2">
      <button
        className="btn-brand-secondary w-full justify-between text-left"
        onClick={onToggle}
        type="button"
      >
        {title}
        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {isOpen && <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>}
    </div>
  );
}

function MiniNote({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/8 p-4 text-slate-200">
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#9DE5BD]">
        <Icon className="size-4" />
      </span>
      <p className="text-sm font-semibold leading-6">{text}</p>
    </div>
  );
}

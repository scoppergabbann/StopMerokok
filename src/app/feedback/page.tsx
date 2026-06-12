"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bug,
  CheckCircle2,
  Lightbulb,
  MessageSquareWarning,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast-provider";
import { persistFeedbackReport } from "@/lib/client-data";
import { trackEvent } from "@/lib/analytics";
import type { FeedbackReport } from "@/lib/mvp-store";

const categories: Array<{
  description: string;
  icon: typeof Bug;
  label: string;
  value: FeedbackReport["category"];
}> = [
  {
    description: "Ada tombol, data, tampilan, atau flow yang tidak berjalan.",
    icon: Bug,
    label: "Bug",
    value: "bug",
  },
  {
    description: "Ada bagian yang bikin bingung atau terasa kurang jelas.",
    icon: MessageSquareWarning,
    label: "Membingungkan",
    value: "confusing",
  },
  {
    description: "Saran fitur, copywriting, desain, atau pengalaman baru.",
    icon: Lightbulb,
    label: "Ide",
    value: "idea",
  },
  {
    description: "Masukan lain yang belum masuk kategori di atas.",
    icon: AlertCircle,
    label: "Lainnya",
    value: "other",
  },
];

const severities: Array<{
  label: string;
  value: FeedbackReport["severity"];
}> = [
  { label: "Ringan", value: "low" },
  { label: "Sedang", value: "medium" },
  { label: "Penting", value: "high" },
];

export default function FeedbackPage() {
  const { showToast } = useToast();
  const [category, setCategory] = useState<FeedbackReport["category"]>("bug");
  const [severity, setSeverity] = useState<FeedbackReport["severity"]>("medium");
  const [pageUrl, setPageUrl] = useState(() =>
    typeof window === "undefined" ? "" : window.location.href,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] bg-white p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#DFF3E8] text-[#2F7D57]">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-6 text-sm font-extrabold uppercase text-[#4FAE7B]">
              Laporan terkirim
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight">
              Makasih, ini akan aku cek.
            </h1>
            <p className="mt-3 leading-7 text-slate-600">
              Masukan seperti ini bakal jadi bahan penting untuk admin panel dan
              perbaikan sebelum launch publik.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                className="rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
                onClick={() => setIsSubmitted(false)}
                type="button"
              >
                Kirim laporan lain
              </button>
              <Link
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-extrabold text-slate-700"
                href="/profile"
              >
                Kembali ke profil
              </Link>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-5">
        <Link
          className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-[#2F7D57]"
          href="/profile"
        >
          <ArrowLeft className="size-4" />
          Kembali ke profil
        </Link>

        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-6 text-white shadow-xl shadow-slate-300/70 sm:p-8">
          <p className="text-sm font-extrabold uppercase text-[#B8F1CE]">
            Feedback & Bug Report
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            Ada yang aneh? Ceritain singkat aja.
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-200">
            Laporanmu akan tersimpan dan nanti bisa aku lihat dari admin panel.
            Jangan tulis password atau data sensitif di kolom detail.
          </p>
        </div>

        <form
          className="space-y-5 rounded-[2rem] bg-white p-5 shadow-sm sm:p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSubmitting(true);

            const form = new FormData(event.currentTarget);
            const title = String(form.get("title") || "").trim();
            const message = String(form.get("message") || "").trim();
            const contact = String(form.get("contact") || "").trim();
            const relatedPage = String(form.get("pageUrl") || "").trim();

            const ok = await persistFeedbackReport({
              category,
              contact: contact || undefined,
              message,
              pageUrl: relatedPage || undefined,
              severity,
              title,
            });

            setIsSubmitting(false);

            if (!ok) {
              showToast({
                message: "Laporan belum berhasil tersimpan. Coba lagi sebentar.",
                title: "Gagal mengirim",
                variant: "info",
              });
              return;
            }

            trackEvent("feedback_submit", {
              category,
              severity,
            });

            showToast({
              message: "Makasih, laporan kamu sudah masuk.",
              title: "Feedback terkirim",
              variant: "success",
            });
            event.currentTarget.reset();
            setCategory("bug");
            setSeverity("medium");
            setIsSubmitted(true);
          }}
        >
          <div>
            <p className="text-sm font-extrabold text-slate-700">
              Jenis laporan
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map((item) => {
                const Icon = item.icon;
                const isActive = category === item.value;

                return (
                  <button
                    className={`rounded-[1.35rem] border p-4 text-left transition ${
                      isActive
                        ? "border-[#4FAE7B] bg-[#DFF3E8] text-[#1F2933]"
                        : "border-slate-200 bg-[#F6F8F7] text-slate-600 hover:border-[#BFE7D1]"
                    }`}
                    key={item.value}
                    onClick={() => setCategory(item.value)}
                    type="button"
                  >
                    <Icon className="size-5 text-[#2F7D57]" />
                    <p className="mt-3 font-extrabold">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-6">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-extrabold text-slate-700">
              Prioritas
            </span>
            <select
              className="select-input mt-2"
              onChange={(event) =>
                setSeverity(event.target.value as FeedbackReport["severity"])
              }
              value={severity}
            >
              {severities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-extrabold text-slate-700">
              Judul singkat
            </span>
            <input
              className="input mt-2"
              maxLength={100}
              minLength={3}
              name="title"
              placeholder="Contoh: Tombol absen tidak bisa diklik"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-extrabold text-slate-700">
              Ceritakan detailnya
            </span>
            <textarea
              className="input mt-2 min-h-36 resize-y"
              maxLength={1200}
              minLength={10}
              name="message"
              placeholder="Apa yang terjadi, kamu sedang di halaman mana, dan apa yang kamu harapkan?"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-extrabold text-slate-700">
              Halaman terkait
            </span>
            <input
              className="input mt-2"
              name="pageUrl"
              onChange={(event) => setPageUrl(event.target.value)}
              placeholder="/dashboard atau link halaman"
              value={pageUrl}
            />
          </label>

          <label className="block">
            <span className="text-sm font-extrabold text-slate-700">
              Kontak opsional
            </span>
            <input
              className="input mt-2"
              maxLength={120}
              name="contact"
              placeholder="Email/WhatsApp kalau boleh dihubungi balik"
            />
          </label>

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4FAE7B] px-5 py-4 font-extrabold text-white shadow-xl shadow-[#4FAE7B]/20 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            <Send className="size-5" />
            {isSubmitting ? "Mengirim..." : "Kirim laporan"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isReady, setIsReady] = useState(!isSupabaseConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setIsReady(Boolean(data.session));
    });
  }, []);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-x-hidden bg-[linear-gradient(145deg,#F7FBF9_0%,#EEF8F5_48%,#F7FBFF_100%)] px-4 py-8 text-[#1F2933]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 h-44 bg-[linear-gradient(100deg,transparent_0%,rgba(79,174,123,0.16)_28%,rgba(66,169,232,0.18)_52%,transparent_80%)] blur-3xl"
      />

      <section className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_28px_90px_rgba(31,41,51,0.12)] backdrop-blur sm:p-8">
        <Link className="mb-8 flex items-center justify-center gap-3" href="/">
          <Image
            alt="StopMerokok"
            className="size-10"
            height={40}
            src="/images/logo-noto-mark-transparent.png"
            width={40}
          />
          <span className="text-2xl font-extrabold tracking-normal">
            <span className="text-[#5DCB4F]">Stop</span>
            <span className="text-[#42A9E8]">Merokok</span>
          </span>
        </Link>

        <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#4FAE7B]">
          Atur ulang kata sandi
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#132238]">
          Buat kata sandi baru
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Pilih kata sandi baru yang mudah kamu ingat, tapi tetap aman.
        </p>

        {!isReady ? (
          <div className="mt-6 rounded-2xl bg-[#FFF4CC] p-4 text-sm font-bold leading-6 text-[#9B6B00]">
            Tautan atur ulang tidak valid atau sudah kedaluwarsa. Minta tautan
            baru dari halaman masuk.
          </div>
        ) : (
          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!supabase) {
                return;
              }

              const form = new FormData(event.currentTarget);
              const password = String(form.get("password") || "");
              const confirmPassword = String(form.get("confirmPassword") || "");

              if (password !== confirmPassword) {
                showToast({
                  message: "Pastikan kedua kata sandi sama.",
                  title: "Kata sandi belum cocok",
                  variant: "info",
                });
                return;
              }

              setIsSubmitting(true);
              const { error } = await supabase.auth.updateUser({ password });
              setIsSubmitting(false);

              if (error) {
                showToast({
                  message: error.message,
                  title: "Gagal memperbarui kata sandi",
                  variant: "info",
                });
                return;
              }

              showToast({
                message: "Kata sandi baru sudah tersimpan.",
                title: "Kata sandi diperbarui",
                variant: "success",
              });
              window.setTimeout(() => router.push("/dashboard"), 500);
            }}
          >
            <label className="block">
              <span className="text-sm font-extrabold text-slate-700">
                Kata sandi baru
              </span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#4FAE7B] focus-within:ring-4 focus-within:ring-[#DFF3E8]">
                <LockKeyhole className="size-5 shrink-0 text-slate-400" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                  minLength={6}
                  name="password"
                  placeholder="Minimal 6 karakter"
                  required
                  type="password"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-extrabold text-slate-700">
                Ulangi kata sandi
              </span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#4FAE7B] focus-within:ring-4 focus-within:ring-[#DFF3E8]">
                <LockKeyhole className="size-5 shrink-0 text-slate-400" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                  minLength={6}
                  name="confirmPassword"
                  placeholder="Ulangi kata sandi baru"
                  required
                  type="password"
                />
              </span>
            </label>

            <button
              className="btn-brand-primary w-full py-4 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan kata sandi baru"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-semibold text-slate-500">
          Ingat kata sandi lama?{" "}
          <Link className="font-extrabold text-[#2F7D57]" href="/login">
            Masuk
          </Link>
        </p>
      </section>
    </main>
  );
}

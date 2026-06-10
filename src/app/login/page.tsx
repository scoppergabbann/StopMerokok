"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, LockKeyhole, Mail } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { loadProfile } from "@/lib/client-data";
import {
  clearRememberedAuthSession,
  isSupabaseConfigured,
  rememberAuthSession,
  supabase,
} from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  async function sendResetEmail() {
    if (!isSupabaseConfigured || !supabase) {
      showToast({
        message: "Mode demo belum terhubung ke email reset password.",
        title: "Reset belum tersedia",
        variant: "info",
      });
      return;
    }

    if (!email) {
      showToast({
        message: "Isi email dulu, lalu coba kirim link reset.",
        title: "Email dibutuhkan",
        variant: "info",
      });
      return;
    }

    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setIsSendingReset(false);

    if (error) {
      showToast({
        message: error.message,
        title: "Reset password gagal",
        variant: "info",
      });
      return;
    }

    showToast({
      message: "Cek email kamu untuk melanjutkan reset password.",
      title: "Link reset dikirim",
      variant: "success",
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#F7FBF9_0%,#EEF8F5_46%,#F7FBFF_100%)] px-5 py-8 text-[#1F2933]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-16 h-40 bg-[linear-gradient(100deg,transparent_0%,rgba(79,174,123,0.16)_28%,rgba(66,169,232,0.18)_50%,transparent_78%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/3 h-64 w-[42rem] rotate-[-12deg] rounded-full border border-white/70 opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-16 h-72 w-[46rem] rotate-[10deg] rounded-full border border-[#DFF3E8]/80 opacity-80"
      />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1fr]">
        <div className="hidden lg:block">
          <Link className="inline-flex items-center gap-3" href="/">
            <Image
              alt="StopMerokok"
              className="size-12"
              height={48}
              priority
              src="/images/logo-noto-mark-transparent.png"
              width={48}
            />
            <span className="text-2xl font-extrabold tracking-normal">
              <span className="text-[#5DCB4F]">Stop</span>
              <span className="text-[#42A9E8]">Merokok</span>
            </span>
          </Link>
          <div className="mt-10 max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#36798D]">
              Ruang pulang untuk progressmu
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-[#132238]">
              Satu check-in kecil bisa menjaga arah hari ini.
            </h1>
            <p className="mt-5 max-w-lg text-lg font-medium leading-8 text-slate-600">
              Lanjutkan catatan bebas rokok, lihat penghematanmu, dan rawat
              momentum tanpa perlu mulai dari nol.
            </p>
          </div>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Absen harian", "Savings", "Track record"].map((item) => (
              <div
                className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm shadow-slate-200/60 backdrop-blur"
                key={item}
              >
                <Check className="size-5 text-[#4FAE7B]" />
                <p className="mt-3 text-sm font-extrabold text-slate-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mr-0">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/88 p-6 shadow-[0_28px_90px_rgba(31,41,51,0.12)] backdrop-blur sm:p-8">
            <Link
              className="mb-8 flex items-center justify-center gap-3 lg:hidden"
              href="/"
            >
              <Image
                alt="StopMerokok"
                className="size-11"
                height={44}
                priority
                src="/images/logo-noto-mark-transparent.png"
                width={44}
              />
              <span className="text-2xl font-extrabold tracking-normal">
                <span className="text-[#5DCB4F]">Stop</span>
                <span className="text-[#42A9E8]">Merokok</span>
              </span>
            </Link>

            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#4FAE7B]">
                Selamat datang lagi
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#132238] sm:text-4xl">
                Masuk untuk lanjutkan progresmu.
              </h1>
              <p className="mt-3 leading-7 text-slate-600">
                Progressmu tersimpan aman dan pribadi.
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                const form = new FormData(event.currentTarget);
                const password = String(form.get("password") || "");

                let nextPath = "/dashboard";

                if (isSupabaseConfigured && supabase) {
                  const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });

                  if (error) {
                    setIsSubmitting(false);
                    showToast({
                      message: error.message,
                      title: "Login gagal",
                      variant: "info",
                    });
                    return;
                  }

                  if (rememberMe) {
                    rememberAuthSession(7);
                  } else {
                    clearRememberedAuthSession();
                  }

                  const profile = await loadProfile();
                  nextPath = profile ? "/dashboard" : "/onboarding";
                }

                showToast({
                  message: isSupabaseConfigured
                    ? nextPath === "/dashboard"
                      ? "Kamu masuk ke dashboard."
                      : "Lengkapi data awal dulu ya."
                    : "Kamu masuk ke dashboard demo.",
                  title: "Login berhasil",
                  variant: "success",
                });
                window.setTimeout(() => router.push(nextPath), 450);
              }}
            >
              <label className="block">
                <span className="text-sm font-extrabold text-slate-700">
                  Email
                </span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#4FAE7B] focus-within:ring-4 focus-within:ring-[#DFF3E8]">
                  <Mail className="size-5 shrink-0 text-slate-400" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    required
                    type="email"
                    value={email}
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-extrabold text-slate-700">
                  Password
                </span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#4FAE7B] focus-within:ring-4 focus-within:ring-[#DFF3E8]">
                  <LockKeyhole className="size-5 shrink-0 text-slate-400" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    name="password"
                    placeholder="Password"
                    required
                    type="password"
                  />
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-600">
                  <input
                    checked={rememberMe}
                    className="size-4 rounded border-slate-300 accent-[#4FAE7B]"
                    onChange={(event) => setRememberMe(event.target.checked)}
                    type="checkbox"
                  />
                  Ingat saya 7 hari
                </label>
                <button
                  className="text-sm font-extrabold text-[#36798D] transition hover:text-[#2F7D57] disabled:opacity-60"
                  disabled={isSendingReset}
                  onClick={sendResetEmail}
                  type="button"
                >
                  {isSendingReset ? "Mengirim..." : "Lupa password?"}
                </button>
              </div>

              <button
                className="w-full rounded-2xl bg-[#4FAE7B] px-5 py-4 font-extrabold text-white shadow-xl shadow-[#4FAE7B]/25 transition hover:-translate-y-0.5 hover:bg-[#449F6E] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? "Menyiapkan ruangmu..."
                  : "Masuk dan lanjutkan progres"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-[#E3F3F7]/70 px-4 py-3 text-center text-sm font-bold text-[#36798D]">
              Sesi disimpan hingga 7 hari di perangkat ini.
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              Belum punya akun?{" "}
              <Link className="font-extrabold text-[#2F7D57]" href="/register">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

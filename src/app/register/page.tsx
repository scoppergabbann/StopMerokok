"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import {
  hasTurnstileSiteKey,
  TurnstileCaptcha,
  type TurnstileCaptchaHandle,
} from "@/components/turnstile-captcha";
import { useToast } from "@/components/toast-provider";
import {
  isSupabaseConfigured,
  rememberAuthSession,
  supabase,
} from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<TurnstileCaptchaHandle | null>(null);

  function resetCaptcha() {
    setCaptchaToken("");
    captchaRef.current?.reset();
  }

  return (
    <main className="auth-fade-in relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#F7FBF9_0%,#EEF8F5_48%,#F7FBFF_100%)] px-5 py-8 text-[#1F2933]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-12 h-44 bg-[linear-gradient(100deg,transparent_0%,rgba(79,174,123,0.16)_26%,rgba(66,169,232,0.18)_54%,transparent_82%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-20 h-72 w-[46rem] rotate-[8deg] rounded-full border border-[#DFF3E8]/90 opacity-75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-1/4 h-64 w-[42rem] rotate-[-12deg] rounded-full border border-white/80 opacity-80"
      />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1fr]">
        <div className="auth-fade-up hidden lg:block">
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
              Mulai tanpa tekanan
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-[#132238]">
              Buat ruang kecil untuk mulai berubah.
            </h1>
            <p className="mt-5 max-w-lg text-lg font-medium leading-8 text-slate-600">
              Cukup buat akun dulu. Setelah itu, kamu bisa isi data awal dan
              mulai absen dengan ritme yang nyaman.
            </p>
          </div>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <MiniRegisterNote
              icon={ShieldCheck}
              text="Data perjalanan tetap pribadi."
            />
            <MiniRegisterNote
              icon={Sparkles}
              text="Langsung lanjut ke onboarding ringan."
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mr-0">
          <div className="auth-fade-up rounded-[1.75rem] border border-white/80 bg-white/88 p-6 shadow-[0_28px_90px_rgba(31,41,51,0.12)] backdrop-blur sm:p-8">
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
                Daftar akun
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#132238] sm:text-4xl">
                Buat akun
              </h1>
              <p className="mt-3 leading-7 text-slate-600">
                Cukup email dan kata sandi. Data awal diisi setelah akun siap.
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);

                const form = new FormData(event.currentTarget);
                const email = String(form.get("email") || "");
                const password = String(form.get("password") || "");

                if (isSupabaseConfigured && supabase) {
                  if (!hasTurnstileSiteKey) {
                    setIsSubmitting(false);
                    showToast({
                      message:
                        "Tambahkan NEXT_PUBLIC_TURNSTILE_SITE_KEY di environment Vercel.",
                      title: "CAPTCHA belum aktif",
                      variant: "info",
                    });
                    return;
                  }

                  if (!captchaToken) {
                    setIsSubmitting(false);
                    showToast({
                      message: "Selesaikan verifikasi keamanan dulu.",
                      title: "CAPTCHA dibutuhkan",
                      variant: "info",
                    });
                    return;
                  }

                  const { data, error } = await supabase.auth.signUp({
                    email,
                    options: {
                      captchaToken,
                    },
                  password,
                  });

                  if (error) {
                    setIsSubmitting(false);
                    resetCaptcha();
                    showToast({
                      message: error.message,
                      title: "Registrasi gagal",
                      variant: "info",
                    });
                    return;
                  }

                  if (!data.session) {
                    setIsSubmitting(false);
                    resetCaptcha();
                    showToast({
                      message:
                        "Akun dibuat, tapi Supabase masih meminta verifikasi email. Matikan konfirmasi email agar pengguna langsung masuk.",
                      title: "Konfirmasi email masih aktif",
                      variant: "info",
                    });
                    return;
                  }

                  rememberAuthSession(7);
                }

                trackEvent("register", {
                  authProvider: isSupabaseConfigured ? "supabase" : "demo",
                });

                showToast({
                  message: isSupabaseConfigured
                    ? "Akun siap. Lanjut isi data awal."
                    : "Akun demo siap. Lanjut isi data awal.",
                  title: "Registrasi berhasil",
                  variant: "success",
                });
                window.setTimeout(() => router.push("/onboarding"), 450);
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
                    placeholder="nama@email.com"
                    required
                    type="email"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-extrabold text-slate-700">
                  Kata sandi
                </span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#4FAE7B] focus-within:ring-4 focus-within:ring-[#DFF3E8]">
                  <LockKeyhole className="size-5 shrink-0 text-slate-400" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    minLength={6}
                    name="password"
                    placeholder="Minimal 6 karakter"
                    required
                    type={isPasswordVisible ? "text" : "password"}
                  />
                  <button
                    aria-label={
                      isPasswordVisible
                        ? "Sembunyikan kata sandi"
                        : "Lihat kata sandi"
                    }
                    className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#36798D]"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                    type="button"
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </span>
              </label>

              <div className="flex items-start gap-3 rounded-2xl bg-[#E3F3F7]/70 px-4 py-3 text-sm font-bold leading-6 text-[#36798D]">
                <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                <span>Progresmu tersimpan aman dan pribadi.</span>
              </div>

              <TurnstileCaptcha
                ref={captchaRef}
                onTokenChange={setCaptchaToken}
              />

              <button
                className="btn-brand-primary w-full py-4"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? "Menyiapkan akunmu..."
                  : "Buat akun"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              Sudah punya akun?{" "}
              <Link className="font-extrabold text-[#2F7D57]" href="/login">
                Masuk
              </Link>
            </p>
            <p className="mt-3 text-center text-xs font-bold text-slate-400">
              <Link className="hover:text-[#36798D]" href="/privacy">
                Privasi & keamanan
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniRegisterNote({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm shadow-slate-200/60 backdrop-blur">
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
        <Icon className="size-4" />
      </span>
      <p className="text-sm font-extrabold leading-6 text-slate-700">{text}</p>
    </div>
  );
}

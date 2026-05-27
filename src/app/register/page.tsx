"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useToast } from "@/components/toast-provider";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <AuthCard
      footer={
        <>
          Sudah punya akun?{" "}
          <Link className="text-[#2F7D57]" href="/login">
            Masuk
          </Link>
        </>
      }
      subtitle="Buat akun dulu, lalu isi data awal supaya progress kamu bisa dihitung."
      title="Mulai perjalananmu"
    >
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const email = String(form.get("email") || "");
          const password = String(form.get("password") || "");

          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
            });

            if (error) {
              showToast({
                message: error.message,
                title: "Registrasi gagal",
                variant: "info",
              });
              return;
            }

            if (!data.session) {
              showToast({
                message:
                  "Akun dibuat. Kalau Supabase minta verifikasi, cek email dulu sebelum login.",
                title: "Registrasi berhasil",
                variant: "success",
              });
              window.setTimeout(() => router.push("/login"), 700);
              return;
            }
          }

          showToast({
            message: isSupabaseConfigured
              ? "Akun dibuat. Lanjut isi data awal."
              : "Akun demo siap. Lanjut isi data awal.",
            title: "Registrasi berhasil",
            variant: "success",
          });
          window.setTimeout(() => router.push("/onboarding"), 450);
        }}
      >
        <label className="block">
          <span className="text-sm font-bold text-slate-600">Email</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#4FAE7B]"
            placeholder="nama@email.com"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-600">Password</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#4FAE7B]"
            minLength={6}
            name="password"
            placeholder="Minimal 6 karakter"
            required
            type="password"
          />
        </label>
        <button className="w-full rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20">
          Lanjut onboarding
        </button>
      </form>
    </AuthCard>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useToast } from "@/components/toast-provider";
import { loadProfile } from "@/lib/client-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <AuthCard
      footer={
        <>
          Belum punya akun?{" "}
          <Link className="text-[#2F7D57]" href="/register">
            Daftar
          </Link>
        </>
      }
      subtitle="Masuk untuk melihat progress harianmu."
      title="Selamat datang lagi"
    >
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const email = String(form.get("email") || "");
          const password = String(form.get("password") || "");

          let nextPath = "/dashboard";

          if (isSupabaseConfigured && supabase) {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              showToast({
                message: error.message,
                title: "Login gagal",
                variant: "info",
              });
              return;
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
            placeholder="Password"
            name="password"
            required
            type="password"
          />
        </label>
        <button className="w-full rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20">
          Masuk dashboard
        </button>
      </form>
    </AuthCard>
  );
}

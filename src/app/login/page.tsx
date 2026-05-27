"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useToast } from "@/components/toast-provider";

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
        onSubmit={(event) => {
          event.preventDefault();
          showToast({
            message: "Kamu masuk ke dashboard demo.",
            title: "Login berhasil",
            variant: "success",
          });
          window.setTimeout(() => router.push("/dashboard"), 450);
        }}
      >
        <label className="block">
          <span className="text-sm font-bold text-slate-600">Email</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#4FAE7B]"
            placeholder="nama@email.com"
            required
            type="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-600">Password</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#4FAE7B]"
            placeholder="Password"
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

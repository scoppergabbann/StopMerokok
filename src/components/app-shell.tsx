"use client";

import {
  BarChart3,
  CircleCheckBig,
  HandHeart,
  HomeIcon,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { loadProfile } from "@/lib/client-data";
import {
  clearRememberedAuthSession,
  hasBrowserSessionAuth,
  hasRememberedAuthSession,
  hasRememberedAuthSessionExpired,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Beranda" },
  { href: "/stats", icon: BarChart3, label: "Statistik" },
  { href: "/check-in", icon: CircleCheckBig, label: "Absen", primary: true },
  { href: "/community", icon: UsersRound, label: "Komunitas" },
  { href: "/berbagi", icon: HandHeart, label: "Berbagi" },
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function AppShell({ children, title = "StopMerokok" }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let isMounted = true;
    const authClient = supabase;

    authClient.auth.getSession().then(async ({ data }) => {
      if (!isMounted) {
        return;
      }

      if (!data.session) {
        if (pathname !== "/login") {
          router.replace("/login");
        }
        return;
      }

      if (!hasRememberedAuthSession() && !hasBrowserSessionAuth()) {
        await authClient.auth.signOut();
        clearRememberedAuthSession();
        router.replace("/login");
        return;
      }

      if (hasRememberedAuthSessionExpired()) {
        await authClient.auth.signOut();
        clearRememberedAuthSession();
        showToast({
          message: "Masuk lagi untuk melanjutkan progres kamu.",
          title: "Sesi 7 hari selesai",
          variant: "info",
        });
        router.replace("/login");
        return;
      }

      const profile = await loadProfile();

      if (!profile && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pathname, router, showToast]);

  return (
    <main className="min-h-screen bg-[#F6F8F7] pb-28 text-[#1F2933]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#F6F8F7]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link className="flex min-w-0 items-center gap-2" href="/dashboard">
            <Image
              alt={title}
              className="size-10 shrink-0"
              height={40}
              src="/images/logo-noto-mark-transparent.png"
              width={40}
            />
            <span className="truncate text-base font-extrabold tracking-normal">
              StopMerokok
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="btn-brand-secondary min-h-10 rounded-full px-4 py-2 text-sm"
              href="/profile"
            >
              Profil
            </Link>
            <button
              className="btn-brand-dark min-h-10 rounded-full px-4 py-2 text-sm"
              onClick={async () => {
                if (isSupabaseConfigured && supabase) {
                  await supabase.auth.signOut();
                }

                clearRememberedAuthSession();

                showToast({
                  message: "Kamu keluar dari sesi saat ini.",
                  title: "Keluar berhasil",
                  variant: "success",
                });
                window.setTimeout(() => router.push("/"), 350);
              }}
              type="button"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-5 py-6">{children}</div>

      <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[min(92vw,430px)]">
        <div className="relative grid h-20 grid-cols-5 items-center rounded-[1.75rem] border border-slate-100 bg-white px-2 py-2 shadow-2xl shadow-slate-300/70">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.primary) {
              return (
                <Link
                  aria-label="Absen harian"
                  className="group relative flex min-w-0 items-center justify-center"
                  href={item.href}
                  key={item.href}
                >
                  <span className="absolute -top-12 grid size-[4.35rem] place-items-center rounded-full bg-[#123B3F] text-white shadow-xl shadow-[#123B3F]/25 ring-8 ring-[#F6F8F7] transition group-hover:-translate-y-0.5">
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl py-1 text-[10px] font-bold transition ${
                  isActive
                    ? "text-[#1F2933]"
                    : "text-slate-400 hover:text-[#4FAE7B]"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

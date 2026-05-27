"use client";

import {
  Activity,
  BarChart3,
  CircleCheckBig,
  HandHeart,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadProfile } from "@/lib/client-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Home" },
  { href: "/stats", icon: BarChart3, label: "Statistic" },
  { href: "/check-in", icon: CircleCheckBig, label: "Check-in", primary: true },
  { href: "/activity", icon: Activity, label: "Activity" },
  { href: "/savings", icon: HandHeart, label: "Berbagi" },
];

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
};

export function AppShell({ children, title = "StopMerokok" }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(
    isSupabaseConfigured,
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) {
        return;
      }

      if (!data.session) {
        router.replace("/login");
        return;
      }

      const profile = await loadProfile();

      if (!profile) {
        router.replace("/onboarding");
        return;
      }

      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F6F8F7] pb-28 text-[#1F2933]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#F6F8F7]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#4FAE7B] font-extrabold text-white">
              S
            </span>
            <span>
              <span className="block text-base font-extrabold">{title}</span>
              <span className="block text-xs font-semibold text-slate-500">
                mulai lagi hari ini
              </span>
            </span>
          </Link>
          <Link
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm"
            href="/profile"
          >
            Profil
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-5 py-6">
        {isCheckingSession ? (
          <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              StopMerokok
            </p>
            <h1 className="mt-2 text-2xl font-extrabold">
              Mengecek sesi kamu...
            </h1>
            <p className="mt-2 leading-7 text-slate-600">
              Sebentar ya, kita siapkan ruang perjalananmu.
            </p>
          </section>
        ) : (
          children
        )}
      </div>

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
                  <span className="absolute -top-12 grid size-[4.35rem] place-items-center rounded-full bg-[#4FAE7B] text-white shadow-xl shadow-[#4FAE7B]/35 ring-8 ring-[#F6F8F7] transition group-hover:-translate-y-0.5">
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

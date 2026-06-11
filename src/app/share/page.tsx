"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Images, Sparkles, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ShareCardPreview } from "@/components/share-card-preview";
import { useToast } from "@/components/toast-provider";
import { loadCheckins, loadProfile } from "@/lib/client-data";
import {
  calculateSummary,
  type CheckinStatus,
  type DailyCheckin,
  type Profile,
} from "@/lib/mvp-store";
import { trackEvent } from "@/lib/analytics";

export default function SharePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([loadProfile(), loadCheckins()]).then(
        ([nextProfile, nextCheckins]) => {
          setProfile(nextProfile);
          setCheckins(nextCheckins);
          setIsLoading(false);
        },
      );
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const summary = useMemo(() => calculateSummary(profile, checkins), [profile, checkins]);
  const latestCheckin = [...checkins].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestStatus: CheckinStatus = latestCheckin?.status ?? "smoke_free";
  const dayNumber = Math.max(1, checkins.length);

  if (isLoading) {
    return (
      <AppShell>
        <section className="space-y-5">
          <div className="h-40 rounded-[2rem] bg-white skeleton-shimmer" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.62fr)]">
            <div className="h-[34rem] rounded-[2rem] bg-white skeleton-shimmer" />
            <div className="h-[34rem] rounded-[2rem] bg-white skeleton-shimmer" />
          </div>
        </section>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Isi data awal"
          body="Lengkapi profil dasar dulu agar Kartu Perjalanan bisa dibuat dari progresmu."
          icon={UserRound}
          title="Profil belum tersedia"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-6 text-white shadow-xl shadow-slate-300/70">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-[#DFF3E8]"
            href="/dashboard"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                Kartu Perjalanan
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Bagikan progress kecil dengan cara yang tetap nyaman.
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                Tidak semua perjalanan harus dipamerkan. Tapi kalau kamu ingin
                merayakannya, kartu ini siap diunduh, dibagikan, atau cukup
                disimpan sendiri.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <Sparkles className="size-7 text-[#9DE5BD]" />
              <p className="mt-4 text-lg font-extrabold">
                Privasi tetap kamu yang pegang.
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                Nama dan angka bisa disembunyikan sebelum kartu dibagikan.
              </p>
            </div>
          </div>
        </div>

        {checkins.length === 0 ? (
          <EmptyState
            actionHref="/check-in"
            actionLabel="Absen dulu"
            body="Kartu harian akan lebih bermakna setelah ada minimal satu check-in."
            icon={Images}
            title="Belum ada progress untuk dibagikan"
          />
        ) : (
          <ShareCardPreview
            data={{
              dayNumber,
              latestStatus,
              profile,
              summary,
            }}
            onCopyCaption={() => {
              trackEvent("share_card_caption_copied");
              showToast({
                message: "Caption Kartu Perjalanan sudah disalin.",
                title: "Caption disalin",
                variant: "success",
              });
            }}
            onDownload={() => {
              trackEvent("share_card_downloaded");
              showToast({
                message: "Kartu Perjalanan tersimpan sebagai PNG.",
                title: "Download berhasil",
                variant: "success",
              });
            }}
            onShare={() => {
              trackEvent("share_card_shared");
              showToast({
                message: "Kartu Perjalanan siap dibagikan.",
                title: "Share diproses",
                variant: "success",
              });
            }}
          />
        )}
      </section>
    </AppShell>
  );
}

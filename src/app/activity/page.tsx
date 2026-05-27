"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { loadCheckins } from "@/lib/client-data";
import {
  statusLabels,
  statusStyles,
  type DailyCheckin,
} from "@/lib/mvp-store";

export default function ActivityPage() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadCheckins().then((items) => setCheckins(items.reverse()));
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Activity
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Riwayat check-in</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Setiap catatan adalah bahan belajar, bukan bahan menghakimi.
        </p>

        <div className="mt-6 space-y-4">
          {checkins.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="font-bold text-slate-600">
                Belum ada riwayat. Coba absen hari ini dulu.
              </p>
            </div>
          ) : (
            checkins.map((checkin) => (
              <article
                className="rounded-[2rem] bg-white p-5 shadow-sm"
                key={checkin.date}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-extrabold">{checkin.date}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {checkin.smokedCount} batang
                      {checkin.mood ? ` • Mood: ${checkin.mood}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      statusStyles[checkin.status]
                    }`}
                  >
                    {statusLabels[checkin.status]}
                  </span>
                </div>
                {checkin.note && (
                  <p className="mt-4 leading-7 text-slate-600">
                    {checkin.note}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}

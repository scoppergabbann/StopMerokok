"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { loadCheckins } from "@/lib/client-data";
import {
  getMonthDays,
  statusLabels,
  statusStyles,
  type DailyCheckin,
} from "@/lib/mvp-store";

const statusDot = {
  smoke_free: "bg-[#4FAE7B]",
  reduced: "bg-[#F4C95D]",
  relapsed: "bg-[#E98080]",
};

export default function CalendarPage() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadCheckins().then((items) => {
      setCheckins(items);
      setSelectedDate(items[items.length - 1]?.date ?? null);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const days = useMemo(() => {
    const now = new Date();
    return getMonthDays(now.getFullYear(), now.getMonth());
  }, []);
  const byDate = new Map(checkins.map((item) => [item.date, item]));
  const selected = selectedDate ? byDate.get(selectedDate) : null;

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Calendar
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Kalender progress</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Hijau untuk bebas rokok, kuning untuk mengurangi, merah lembut untuk
          kambuh, abu-abu untuk belum absen.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const checkin = byDate.get(day);

                return (
                  <button
                    className={`aspect-square rounded-2xl text-sm font-extrabold transition ${
                      selectedDate === day
                        ? "ring-2 ring-[#4FAE7B] ring-offset-2"
                        : ""
                    } ${
                      checkin
                        ? statusStyles[checkin.status]
                        : "bg-slate-100 text-slate-400"
                    }`}
                    key={day}
                    onClick={() => setSelectedDate(day)}
                  >
                    {Number(day.slice(-2))}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold">Detail tanggal</h2>
            {!selectedDate ? (
              <p className="mt-4 leading-7 text-slate-600">
                Pilih tanggal untuk melihat detail check-in.
              </p>
            ) : selected ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-3 rounded-full ${statusDot[selected.status]}`}
                  />
                  <span className="font-extrabold">
                    {statusLabels[selected.status]}
                  </span>
                </div>
                <Info label="Tanggal" value={selected.date} />
                <Info label="Jumlah rokok" value={`${selected.smokedCount} batang`} />
                <Info label="Mood" value={selected.mood || "-"} />
                <Info label="Trigger" value={selected.trigger || "-"} />
                <Info label="Catatan" value={selected.note || "-"} />
              </div>
            ) : (
              <p className="mt-4 leading-7 text-slate-600">
                Belum ada check-in untuk {selectedDate}.
              </p>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F8F7] p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}

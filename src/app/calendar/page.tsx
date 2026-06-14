"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { loadCheckins } from "@/lib/client-data";
import {
  getCalendarMonthDays,
  statusLabels,
  statusStyles,
  type DailyCheckin,
} from "@/lib/mvp-store";

const statusDot = {
  smoke_free: "bg-[#4FAE7B]",
  reduced: "bg-[#F4C95D]",
  relapsed: "bg-[#E98080]",
};

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarPage() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadCheckins().then((items) => {
        setCheckins(items);
        setSelectedDate(items[items.length - 1]?.date ?? null);
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const days = useMemo(() => {
    return getCalendarMonthDays(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
    );
  }, [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const isCurrentMonth =
    visibleMonth.getFullYear() === currentMonth.getFullYear() &&
    visibleMonth.getMonth() === currentMonth.getMonth();
  const byDate = new Map(checkins.map((item) => [item.date, item]));
  const selected = selectedDate ? byDate.get(selectedDate) : null;

  function changeVisibleMonth(direction: -1 | 1) {
    setVisibleMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + direction, 1),
    );
  }

  function showCurrentMonth() {
    setVisibleMonth(currentMonth);
  }

  return (
    <AppShell>
      <section>
        <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
          Kalender
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Kalender progres</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Hijau untuk bebas rokok, kuning untuk mengurangi, merah lembut untuk
          kambuh, abu-abu untuk belum absen.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold capitalize">
                {isCurrentMonth ? "Bulan ini" : monthLabel}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Bulan sebelumnya"
                  className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  onClick={() => changeVisibleMonth(-1)}
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                {!isCurrentMonth && (
                  <button
                    className="rounded-full bg-[#E3F3F7] px-3 py-2 text-xs font-extrabold text-[#36798D]"
                    onClick={showCurrentMonth}
                    type="button"
                  >
                    Bulan ini
                  </button>
                )}
                <button
                  aria-label="Bulan berikutnya"
                  className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isCurrentMonth}
                  onClick={() => changeVisibleMonth(1)}
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekdayLabels.map((day) => (
                <div
                  className="grid h-8 place-items-center text-xs font-extrabold text-slate-500"
                  key={day}
                >
                  {day}
                </div>
              ))}
              {days.map((day) => {
                const checkin = byDate.get(day.date);

                return (
                  <button
                    className={`aspect-square rounded-2xl text-sm font-extrabold transition ${
                      selectedDate === day.date
                        ? "ring-2 ring-[#4FAE7B] ring-offset-2"
                        : ""
                    } ${
                      !day.isCurrentMonth
                        ? "bg-white text-slate-300"
                        : checkin
                        ? statusStyles[checkin.status]
                        : "bg-slate-100 text-slate-400"
                    }`}
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    {Number(day.date.slice(-2))}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold">Detail tanggal</h2>
            {!selectedDate ? (
              <div className="mt-4">
                <EmptyState
                  actionHref="/check-in"
                  actionLabel="Absen hari ini"
                  body="Klik salah satu tanggal di kalender untuk melihat detail, koreksi, atau mulai mencatat hari itu."
                  icon={CalendarPlus}
                  title="Pilih tanggal di kalender"
                />
              </div>
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
                <Info label="Perasaan" value={selected.mood || "-"} />
                <Info label="Pemicu" value={selected.trigger || "-"} />
                <Info label="Catatan" value={selected.note || "-"} />
                <Link
                  className="btn-brand-primary"
                  href={`/check-in?date=${selected.date}`}
                >
                  Koreksi absen tanggal ini
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  actionHref={`/check-in?date=${selectedDate}`}
                  actionLabel="Isi absen tanggal ini"
                  body={`Tanggal ${selectedDate} belum punya catatan. Kamu bisa mengisi atau mengoreksinya sekarang.`}
                  icon={CalendarPlus}
                  title="Belum ada absen"
                />
              </div>
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

"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { NotebookPen } from "lucide-react";
import { loadJournals, persistJournal } from "@/lib/client-data";
import {
  todayKey,
  type JournalEntry,
  type Mood,
} from "@/lib/mvp-store";

const moods: Mood[] = ["Tenang", "Stres", "Senang", "Capek", "Sedih", "Semangat"];

export default function JournalPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadJournals().then((items) => {
        setJournals([...items].reverse());
        setTodayJournal(
          items.find((journal) => journal.date === todayKey()) ?? null,
        );
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Jurnal
          </p>
          <h1 className="mt-2 text-4xl font-extrabold">Catatan harian</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Tulis secukupnya. Ini ruang untuk memahami perjalananmu, bukan
            menghakimi dirimu.
          </p>

          <form
            className="mt-6 space-y-4 rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const entry: JournalEntry = {
                challenge: String(form.get("challenge") || ""),
                createdAt: new Date().toISOString(),
                date: todayKey(),
                gratitude: String(form.get("gratitude") || ""),
                mood: String(form.get("mood") || "Tenang") as Mood,
                story: String(form.get("story") || ""),
                tomorrowFocus: String(form.get("tomorrowFocus") || ""),
              };

              await persistJournal(entry);
              setTodayJournal(entry);
              const nextJournals = await loadJournals();
              setJournals([...nextJournals].reverse());
              showToast({
                message: "Catatan hari ini sudah tersimpan.",
                title: "Jurnal tersimpan",
                variant: "success",
              });
            }}
          >
            <label className="block">
              <span className="text-sm font-bold text-slate-600">
                Perasaan hari ini
              </span>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#4FAE7B]"
                defaultValue={todayJournal?.mood ?? "Tenang"}
                name="mood"
              >
                {moods.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </label>
            <TextArea
              defaultValue={todayJournal?.story}
              label="Cerita hari ini"
              name="story"
              placeholder="Apa yang terjadi hari ini?"
            />
            <TextArea
              defaultValue={todayJournal?.challenge}
              label="Tantangan hari ini"
              name="challenge"
              placeholder="Momen apa yang paling berat?"
            />
            <TextArea
              defaultValue={todayJournal?.gratitude}
              label="Hal yang disyukuri"
              name="gratitude"
              placeholder="Satu hal kecil yang tetap baik hari ini."
            />
            <TextArea
              defaultValue={todayJournal?.tomorrowFocus}
              label="Besok ingin lebih baik dalam hal apa?"
              name="tomorrowFocus"
              placeholder="Contoh: menghindari kopi malam, jalan 5 menit saat dorongan merokok muncul."
            />
            <button className="w-full rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20">
              Simpan jurnal hari ini
            </button>
          </form>
        </div>

        <aside className="rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold">Riwayat jurnal</h2>
          <div className="mt-5 space-y-4">
            {journals.length === 0 ? (
              <EmptyState
                body="Mulai dari satu kalimat saja. Catatan pertama akan membantu kamu melihat pola emosi dan trigger besok."
                icon={NotebookPen}
                title="Jurnal pertamamu belum ditulis"
              />
            ) : (
              journals.slice(0, 6).map((journal) => (
                <article
                  className="rounded-2xl bg-[#F6F8F7] p-4"
                  key={journal.date}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold">{journal.date}</p>
                    <span className="rounded-full bg-[#DFF3E8] px-3 py-1 text-xs font-extrabold text-[#2F7D57]">
                      {journal.mood}
                    </span>
                  </div>
                  {journal.story && (
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                      {journal.story}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

function TextArea({
  defaultValue,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <textarea
        className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4FAE7B]"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

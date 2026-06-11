"use client";

import {
  ArrowRight,
  CalendarCheck2,
  HeartHandshake,
  HeartPulse,
  Leaf,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UsersRound,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";

const navItems = [
  { href: "#beranda", label: "Beranda" },
  { href: "#fitur", label: "Fitur" },
  { href: "#perjalanan", label: "Perjalanan" },
  { href: "#alasan", label: "Alasan" },
  { href: "#cerita", label: "Cerita" },
  { href: "#komunitas", label: "Komunitas" },
];

const featureCards = [
  {
    body: "Catat bebas rokok, mengurangi, atau kambuh dengan bahasa yang tidak menghakimi.",
    icon: CalendarCheck2,
    title: "Absen harian",
  },
  {
    body: "Saat dorongan muncul, buka timer, napas pelan, dan gerak kecil untuk melewati momen berat.",
    icon: TimerReset,
    title: "Bantuan dorongan",
  },
  {
    body: "Lihat uang yang tidak jadi terbakar, lalu arahkan ke hadiah kecil atau dukungan website.",
    icon: WalletCards,
    title: "Penghematan",
  },
  {
    body: "Dukungan ringan dari orang lain yang juga sedang mencoba berhenti atau mengurangi.",
    icon: UsersRound,
    title: "Komunitas",
  },
];

const journeyStats = [
  {
    label: "Hari tercatat",
    value: "23",
  },
  {
    label: "Uang dihemat",
    value: "Rp210rb",
  },
  {
    label: "Dorongan terlewati",
    value: "8x",
  },
];

const reasons = [
  "Napas lebih lega",
  "Uang punya arah",
  "Keluarga lebih tenang",
  "Mulai lagi tanpa malu",
];

const testimonialPlaceholders = [
  {
    body: "Aku cuma butuh tempat yang tidak menghakimi. Check-in harian bikin progres kecil terasa kelihatan.",
    label: "Pengguna awal",
    title: "Mulai lebih jujur",
  },
  {
    body: "Melihat uang yang dihemat bikin keputusan menunda rokok terasa lebih konkret.",
    label: "Calon testimoni",
    title: "Progress jadi nyata",
  },
  {
    body: "Kalau kambuh, copy-nya tidak bikin malu. Rasanya lebih mudah mulai lagi besok.",
    label: "Calon testimoni",
    title: "Aman untuk kembali",
  },
];

const educationSlots = [
  {
    label: "Podcast dokter",
    title: "Obrolan santai tentang efek rokok ke tubuh",
  },
  {
    label: "Spesialis jantung",
    title: "Kenapa berhenti pelan-pelan tetap berarti",
  },
  {
    label: "Public figure",
    title: "Cerita anak muda yang memilih hidup lebih sehat",
  },
];

export default function LandingV2Page() {
  const [activeSection, setActiveSection] = useState(navItems[0].href);
  const scrollRootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = scrollRootRef.current;

    if (!root) {
      return;
    }

    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(`#${visibleEntry.target.id}`);
        }
      },
      {
        root,
        rootMargin: "-28% 0px -46% 0px",
        threshold: [0.2, 0.35, 0.5, 0.65],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const root = scrollRootRef.current;
    const target = document.querySelector<HTMLElement>(href);

    if (!root || !target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(href);
  }

  return (
    <main
      className="h-screen overflow-y-auto scroll-smooth bg-[#FBFCFB] text-[#063D43] [scroll-padding-top:5.5rem] md:snap-y md:snap-proximity"
      ref={scrollRootRef}
    >
      <nav
        aria-label="Navigasi preview landing"
        className="sticky top-0 z-50 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"
      >
        <Link
          className="flex items-center gap-3 rounded-full border border-white/75 bg-white/68 py-1.5 pl-2 pr-4 shadow-[0_16px_50px_rgba(6,61,67,0.1)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/85"
          href="/"
        >
          <Image
            alt="StopMerokok"
            className="size-10"
            height={44}
            priority
            src="/images/logo-noto-mark-transparent.png"
            width={44}
          />
          <span className="hidden text-2xl font-semibold tracking-normal sm:inline">
            StopMerokok
          </span>
        </Link>

        <div className="hidden rounded-full border border-white/75 bg-white/62 p-1 shadow-[0_16px_50px_rgba(6,61,67,0.1)] backdrop-blur-xl lg:flex">
          {navItems.map((item) => (
            <a
              className={`rounded-full px-5 py-2 text-sm font-bold transition duration-300 ${
                activeSection === item.href
                  ? "bg-[#86D9DD] text-[#083D43] shadow-[0_8px_20px_rgba(6,61,67,0.08)]"
                  : "text-[#315E62] hover:bg-white hover:text-[#063D43]"
              }`}
              href={item.href}
              key={item.label}
              onClick={(event) => scrollToSection(event, item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-full border border-[#063D43]/10 bg-[#063D43]/95 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_45px_rgba(6,61,67,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-[#0A4E55]"
          href="/register"
        >
          Mulai
          <ArrowRight className="size-4" />
        </Link>
      </nav>

      <section
        className="relative -mt-[5.5rem] min-h-screen overflow-hidden bg-[linear-gradient(180deg,#EFFAF3_0%,#F8FCFA_82%,#FBFCFB_100%)] pt-[5.5rem] md:snap-start"
        id="beranda"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(6,61,67,0.045)_1px,transparent_1px)] bg-[size:25%_100%]"
        />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-16 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:pb-24">
          <Reveal className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#CFE9DE] bg-white/85 px-3 py-2 text-sm font-bold text-[#315E62] shadow-sm">
              <span className="rounded-full bg-[#7AD8DC] px-3 py-1 text-xs font-extrabold text-[#063D43]">
                Baru
              </span>
              Ruang tenang untuk berhenti merokok
            </div>

            <h1 className="max-w-4xl text-[3.25rem] font-semibold leading-[1.02] tracking-normal sm:text-7xl lg:text-[6.1rem]">
              Berhenti merokok tidak harus terasa sendirian.
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-medium leading-8 text-[#315E62] sm:text-xl sm:leading-9">
              StopMerokok membantu kamu mencatat hari, memahami pola, melewati
              dorongan, dan melihat progres kecil yang pelan-pelan jadi besar.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#063D43] px-7 py-3 font-bold text-white shadow-[0_20px_55px_rgba(6,61,67,0.22)]"
                href="/register"
              >
                Mulai perjalanan
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#CFE9DE] bg-white px-7 py-3 font-bold text-[#063D43] shadow-sm"
                href="/login"
              >
                Masuk
              </Link>
            </div>
          </Reveal>

          <Reveal className="relative mx-auto w-full max-w-2xl lg:max-w-none" delay={130}>
            <div className="absolute -bottom-5 left-8 right-8 h-10 rounded-[2rem] bg-[#063D43]/10 blur-xl" />
            <div className="relative overflow-hidden rounded-[2.6rem] border border-white bg-white/88 p-4 shadow-[0_35px_110px_rgba(6,61,67,0.18)] backdrop-blur md:p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
                <div className="rounded-[2.1rem] bg-[#063D43] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/12 px-4 py-2 text-xs font-bold">
                      Hari ini
                    </span>
                    <Leaf className="size-6 text-[#9DE5BD]" />
                  </div>
                  <p className="mt-20 text-sm font-bold text-[#9DE5BD]">
                    Fokus hari ini
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold leading-tight">
                    Satu napas lebih lega.
                  </h2>
                  <p className="mt-5 leading-7 text-[#D8E8E3]">
                    Kamu belum harus sempurna. Cukup hadir dan catat satu hari
                    ini dengan jujur.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[2.1rem] border border-[#BFE7D1] bg-[#DFF3E8] p-6 shadow-sm">
                    <p className="text-sm font-bold text-[#1E6644]">
                      Rentetan aktif
                    </p>
                    <p className="mt-4 text-6xl font-semibold">7</p>
                    <p className="mt-2 font-bold text-[#1E6644]">hari</p>
                  </div>
                  <div className="rounded-[2.1rem] border border-[#C9E7EF] bg-[#E3F3F7] p-6 shadow-sm">
                    <p className="text-sm font-bold text-[#245F6F]">
                      Target berikutnya
                    </p>
                    <p className="mt-4 text-3xl font-semibold">30 hari</p>
                    <div className="mt-5 h-2.5 rounded-full bg-white">
                      <div className="h-full w-1/4 rounded-full bg-[#063D43]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {journeyStats.map((stat) => (
                  <div
                    className="rounded-3xl border border-[#E6F0EC] bg-[#F8FBF9] p-5"
                    key={stat.label}
                  >
                    <p className="text-sm font-bold text-[#315E62]">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 py-28 sm:px-8 md:snap-start"
        id="fitur"
      >
        <Reveal>
          <p className="text-center text-sm font-extrabold text-[#315E62]">
            Fitur inti
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-semibold leading-tight sm:text-6xl">
            Dibuat untuk dibuka sebentar, tapi terasa menemani.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal
                className="min-h-80 rounded-[2.2rem] border border-[#E6F0EC] bg-white p-6 shadow-[0_22px_70px_rgba(6,61,67,0.06)]"
                delay={index * 80}
                key={feature.title}
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#E3F3F7] text-[#063D43]">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-24 text-2xl font-semibold leading-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm font-medium leading-6 text-[#315E62]">
                  {feature.body}
                </p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section
        className="mx-auto grid min-h-screen max-w-7xl gap-16 px-5 py-24 sm:px-8 md:snap-start lg:grid-cols-[0.86fr_1.14fr] lg:items-center"
        id="perjalanan"
      >
        <Reveal>
          <p className="text-sm font-extrabold text-[#315E62]">
            Perjalanan yang bisa diukur
          </p>
          <h2 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">
            Kebiasaan awal bukan untuk menghakimi.
          </h2>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#315E62]">
            Data baseline membantu kamu melihat jarak yang sudah ditempuh:
            berapa batang dihindari, uang dihemat, dan pola yang mulai berubah.
          </p>
        </Reveal>

        <Reveal
          className="relative min-h-[27rem] overflow-hidden rounded-[2.6rem] border border-[#E6F0EC] bg-white p-8 shadow-[0_30px_100px_rgba(6,61,67,0.08)]"
          delay={120}
        >
          <div className="absolute right-8 top-8 hidden h-72 w-72 rounded-[999px] border border-[#E4EFEB] sm:block" />
          <div className="absolute right-20 top-20 hidden h-48 w-48 rounded-[999px] border border-[#E4EFEB] sm:block" />
          <div className="relative z-10">
            <p className="text-xl font-semibold">Batang berkurang</p>
            <div className="mt-12 flex items-end gap-5">
              <p className="text-8xl font-semibold text-[#063D43]">56</p>
              <ArrowRight className="mb-4 size-10 rotate-90 text-[#063D43]" />
            </div>
            <p className="mt-6 max-w-sm leading-7 text-[#315E62]">
              Setelah beberapa minggu, angka kecil mulai terasa sebagai bukti
              bahwa tubuhmu bisa belajar ritme baru.
            </p>

            <div className="mt-14 grid gap-3 sm:grid-cols-3">
              <MiniMetric label="Minggu pertama" value="12" />
              <MiniMetric label="Minggu kedua" value="8" />
              <MiniMetric label="Minggu ini" value="4" />
            </div>
          </div>
        </Reveal>
      </section>

      <section
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 py-24 sm:px-8 md:snap-start"
        id="alasan"
      >
        <Reveal className="rounded-[2.6rem] border border-[#C9E7EF] bg-[#E3F3F7] p-7 shadow-[0_28px_90px_rgba(6,61,67,0.07)] sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold text-[#245F6F]">
                Kenapa bertahan
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
                Alasan kecil yang tetap kamu bawa.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div
                  className="rounded-3xl border border-white/80 bg-white/75 p-5 font-bold text-[#063D43] shadow-sm"
                  key={reason}
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section
        className="mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-24 sm:px-8 md:snap-start lg:grid-cols-[0.88fr_1.12fr] lg:items-center"
        id="cerita"
      >
        <Reveal>
          <p className="text-sm font-extrabold text-[#315E62]">
            Cerita dan edukasi
          </p>
          <h2 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">
            Nanti, suara asli pengguna dan edukasi sehat punya panggung sendiri.
          </h2>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#315E62]">
            Section ini disiapkan untuk testimonial real user dan kurasi video
            edukatif dari dokter, podcast kesehatan, atau figur publik yang
            relevan untuk anak muda.
          </p>
        </Reveal>

        <div className="grid gap-4">
          <Reveal
            className="rounded-[2.4rem] border border-[#E6F0EC] bg-white p-5 shadow-[0_26px_90px_rgba(6,61,67,0.07)]"
            delay={120}
          >
            <div className="grid gap-3 md:grid-cols-3">
              {testimonialPlaceholders.map((item) => (
                <div
                  className="rounded-[1.8rem] bg-[#F7FBF9] p-5"
                  key={item.title}
                >
                  <Quote className="size-6 text-[#4FAE7B]" />
                  <p className="mt-8 text-lg font-semibold leading-7 text-[#1F555B]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#315E62]">
                    {item.body}
                  </p>
                  <p className="mt-6 text-xs font-extrabold uppercase text-[#4FAE7B]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal
            className="grid gap-4 md:grid-cols-3"
            delay={220}
          >
            {educationSlots.map((slot) => (
              <div
                className="group overflow-hidden rounded-[2rem] border border-[#C9E7EF] bg-[#E3F3F7] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(6,61,67,0.1)]"
                key={slot.title}
              >
                <div className="grid aspect-video place-items-center rounded-[1.5rem] bg-[linear-gradient(135deg,#063D43,#4FAE7B)] text-white">
                  <PlayCircle className="size-12 transition duration-300 group-hover:scale-110" />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase text-[#245F6F]">
                  {slot.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-6">
                  {slot.title}
                </h3>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        className="mx-auto grid min-h-screen max-w-7xl gap-12 px-5 py-24 sm:px-8 md:snap-start lg:grid-cols-[1fr_0.9fr] lg:items-center"
        id="komunitas"
      >
        <Reveal>
          <p className="text-sm font-extrabold text-[#315E62]">Komunitas</p>
          <h2 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">
            Ada hari berat. Kamu tetap boleh kembali.
          </h2>
        </Reveal>
        <Reveal
          className="rounded-[2.4rem] border border-[#E6F0EC] bg-white p-8 shadow-[0_26px_90px_rgba(6,61,67,0.07)]"
          delay={120}
        >
          <HeartHandshake className="size-8 text-[#4FAE7B]" />
          <p className="mt-10 text-xl font-semibold leading-9 text-[#1F555B]">
            &ldquo;Hari ini belum sempurna, tapi aku tetap hadir. Membaca dukungan
            kecil seperti ini bikin besok terasa lebih mungkin.&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="font-extrabold">Teman StopMerokok</p>
              <p className="text-sm font-bold text-[#315E62]">
                14 hari mencoba lagi
              </p>
            </div>
            <div className="flex gap-2 text-[#063D43]">
              <ShieldCheck className="size-5" />
              <Sparkles className="size-5" />
              <HeartPulse className="size-5" />
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-8 pt-24 sm:px-8 md:snap-start">
        <Reveal className="rounded-[2.6rem] border border-[#E6F0EC] bg-white p-8 shadow-[0_24px_85px_rgba(6,61,67,0.06)] sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-4xl font-semibold leading-tight sm:text-6xl">
                Mulai dari satu absen jujur hari ini.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-[#063D43] px-6 py-3 font-bold text-white"
                  href="/register"
                >
                  Buat akun
                </Link>
                <Link
                  className="rounded-full border border-[#CFE9DE] px-6 py-3 font-bold text-[#063D43]"
                  href="/"
                >
                  Kembali ke landing utama
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:justify-end">
              <Image
                alt="StopMerokok"
                className="size-12"
                height={48}
                src="/images/logo-noto-mark-transparent.png"
                width={48}
              />
              <p className="text-3xl font-semibold">StopMerokok</p>
            </div>
          </div>
        </Reveal>
      </footer>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#E6F0EC] bg-[#F8FBF9] p-4">
      <p className="text-sm font-bold text-[#315E62]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

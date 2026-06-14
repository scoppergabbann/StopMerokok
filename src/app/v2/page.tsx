"use client";

import {
  ArrowRight,
  CalendarCheck2,
  HeartHandshake,
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
import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";

const navItems = [
  { href: "#beranda", label: "Beranda" },
  { href: "#fitur", label: "Fitur" },
  { href: "#tabungan", label: "Tabungan" },
  { href: "#cerita", label: "Cerita" },
  { href: "#mulai", label: "Mulai" },
];

const sectionHrefs = navItems.map((item) => item.href);

const featureCards = [
  {
    body: "Catat bebas rokok, mengurangi, atau kambuh dengan bahasa yang tetap aman.",
    icon: CalendarCheck2,
    title: "Absen harian",
  },
  {
    body: "Saat dorongan muncul, buka timer, napas pelan, dan gerak kecil untuk lewat dari momen berat.",
    icon: TimerReset,
    title: "Bantuan craving",
  },
  {
    body: "Lihat uang yang tidak jadi asap, lalu arahkan ke hal yang lebih berarti.",
    icon: WalletCards,
    title: "Penghematan",
  },
  {
    body: "Ruang kecil untuk saling menguatkan tanpa merasa sedang dibandingkan.",
    icon: UsersRound,
    title: "Komunitas",
  },
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

const savingTargets = [
  {
    current: "Rp40.000",
    progress: "40%",
    target: "Rp100.000",
    title: "Donasi anak yatim",
  },
  {
    current: "Rp75.000",
    progress: "50%",
    target: "Rp150.000",
    title: "Traktir keluarga",
  },
];

const savingTags = [
  "Anak yatim",
  "Fakir miskin",
  "Lansia",
  "Keluarga",
  "Masjid",
  "Panti asuhan",
];

export default function LandingV2Page() {
  const [activeSection, setActiveSection] = useState(navItems[0].href);
  const isWheelLockedRef = useRef(false);
  const scrollRootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = scrollRootRef.current;

    if (!root) {
      return;
    }

    const sections = sectionHrefs
      .map((href) => document.querySelector<HTMLElement>(href))
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

  function getSectionElements() {
    return sectionHrefs
      .map((href) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));
  }

  function getCurrentSectionIndex() {
    const root = scrollRootRef.current;

    if (!root) {
      return 0;
    }

    const sections = getSectionElements();
    const currentTop = root.scrollTop + window.innerHeight * 0.36;

    return sections.reduce((nearestIndex, section, index) => {
      const nearestDistance = Math.abs(sections[nearestIndex].offsetTop - currentTop);
      const distance = Math.abs(section.offsetTop - currentTop);

      return distance < nearestDistance ? index : nearestIndex;
    }, 0);
  }

  function scrollToHref(href: string) {
    const root = scrollRootRef.current;
    const target = document.querySelector<HTMLElement>(href);

    if (!root || !target) {
      return;
    }

    setActiveSection(href);
    root.scrollTo({
      behavior: "smooth",
      top: target.offsetTop,
    });
  }

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    scrollToHref(href);
  }

  useEffect(() => {
    const root = scrollRootRef.current;

    if (!root) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      if (
        !root ||
        window.innerWidth < 768 ||
        event.ctrlKey ||
        Math.abs(event.deltaY) < 12 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }

      event.preventDefault();

      if (isWheelLockedRef.current) {
        return;
      }

      const currentIndex = getCurrentSectionIndex();
      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(
        sectionHrefs.length - 1,
        Math.max(0, currentIndex + direction),
      );

      if (nextIndex === currentIndex) {
        return;
      }

      isWheelLockedRef.current = true;
      scrollToHref(sectionHrefs[nextIndex]);

      window.setTimeout(() => {
        isWheelLockedRef.current = false;
      }, 760);
    }

    root.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      root.removeEventListener("wheel", handleWheel);
    };
  });

  return (
    <main
      className="h-screen overflow-y-auto overscroll-contain scroll-smooth bg-[#FBFCFB] font-sans text-[#063D43] [scroll-padding-top:5.5rem]"
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
          <span className="hidden text-2xl font-extrabold tracking-normal sm:inline">
            StopMerokok
          </span>
        </Link>

        <div className="hidden rounded-full border border-white/75 bg-white/62 p-1 shadow-[0_16px_50px_rgba(6,61,67,0.1)] backdrop-blur-xl lg:flex">
          {navItems.map((item) => (
            <a
              className={`rounded-full px-5 py-2 text-sm font-extrabold transition duration-300 ${
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
          className="btn-brand-dark min-h-12 rounded-full px-5 py-3 text-sm backdrop-blur-xl"
          href="/register"
        >
          Mulai
          <ArrowRight className="size-4" />
        </Link>
      </nav>

      <section
        className="relative -mt-[5.5rem] min-h-screen overflow-hidden bg-[linear-gradient(180deg,#EFFAF3_0%,#F8FCFA_82%,#FBFCFB_100%)] pt-[5.5rem]"
        id="beranda"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(6,61,67,0.045)_1px,transparent_1px)] bg-[size:25%_100%]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-center px-5 pb-14 pt-12 sm:px-8">
          <Reveal className="relative overflow-visible rounded-[2rem] bg-[linear-gradient(135deg,#113C40_0%,#1D5A60_60%,#4FAE7B_145%)] p-6 text-white shadow-[0_30px_90px_rgba(6,61,67,0.22)] sm:p-10 lg:min-h-[34rem] lg:p-12">
            <div className="relative z-10 max-w-2xl">
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                StopMerokok
              </p>
              <h1 className="mt-6 text-5xl font-black leading-[1.04] tracking-normal sm:text-7xl lg:text-[5.4rem]">
                Berhenti merokok tidak harus terasa sendirian.
              </h1>
              <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-[#EAF8F1] sm:text-xl sm:leading-9">
                Catat hari, pahami pola, dan jaga progress kecil yang bisa kamu
                ulang besok.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="btn-brand-secondary min-h-14 rounded-full px-7 py-4 text-base"
                  href="/register"
                >
                  Mulai perjalanan
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  className="btn-brand-ghost min-h-14 rounded-full px-7 py-4"
                  href="/login"
                >
                  Masuk
                </Link>
              </div>
            </div>

            <div className="mt-10 lg:absolute lg:right-8 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 xl:right-12">
              <AppPreviewMockup />
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 py-28 sm:px-8"
        id="fitur"
      >
        <Reveal>
          <p className="text-center text-sm font-extrabold uppercase text-[#2B8B61]">
            Fitur inti
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-black leading-tight sm:text-6xl">
            Dibuat untuk dibuka sebentar, tapi terasa menemani.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal
                className="min-h-72 rounded-[2rem] border border-[#E6F0EC] bg-white p-6 shadow-[0_22px_70px_rgba(6,61,67,0.06)]"
                delay={index * 80}
                key={feature.title}
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#E3F3F7] text-[#063D43]">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-16 text-2xl font-extrabold leading-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm font-medium leading-6 text-[#315E62]">
                  {feature.body}
                </p>
              </Reveal>
            );
          })}
        </div>

        <Reveal
          className="mt-8 rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_60%,#4FAE7B_140%)] p-7 text-white shadow-[0_26px_80px_rgba(6,61,67,0.2)] sm:p-9"
          delay={140}
        >
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                Bantuan cepat
              </p>
              <h3 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
                Kalau dorongan muncul, jangan lawan sendirian.
              </h3>
            </div>
            <Link
              className="btn-brand-secondary min-h-14 rounded-full px-7 py-4"
              href="/craving"
            >
              Buka bantuan craving
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </Reveal>
      </section>

      <section
        className="mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center"
        id="tabungan"
      >
        <Reveal>
          <p className="text-sm font-extrabold uppercase text-[#36798D]">
            Penghematan jadi kebaikan
          </p>
          <h2 className="mt-4 max-w-2xl text-5xl font-black leading-tight text-[#123B3F] sm:text-6xl">
            Uang yang biasanya hilang bisa berubah jadi target yang terlihat.
          </h2>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[#315E62]">
            Buat beberapa target sekaligus, lihat kemajuan per target, lalu
            catat saat penghematan benar-benar dialokasikan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn-brand-dark min-h-14 rounded-full px-7 py-4"
              href="/register"
            >
              Mulai hitung penghematan
              <ArrowRight className="size-5" />
            </Link>
            <Link
              className="btn-brand-secondary min-h-14 rounded-full px-7 py-4"
              href="/berbagi"
            >
              Lihat berbagi
            </Link>
          </div>
        </Reveal>

        <Reveal
          className="relative rounded-[2.4rem] border border-white/80 bg-white p-5 shadow-[0_30px_100px_rgba(6,61,67,0.11)] sm:p-7"
          delay={120}
        >
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-5 size-32 rounded-full bg-[#DFF3E8] blur-2xl"
          />
          <div className="relative">
            <div className="rounded-[2rem] bg-[#DFF3E8] p-6">
              <p className="text-sm font-extrabold text-[#2F7D57]">
                Simulasi bulan ini
              </p>
              <p className="mt-3 text-4xl font-black text-[#1F2933] sm:text-5xl">
                Rp184.000
              </p>
              <p className="mt-3 text-base font-semibold text-[#426070]">
                Bisa kamu simpan, rayakan, atau bagikan.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {savingTargets.map((target) => (
                <div
                  className="rounded-[1.5rem] bg-[#F6F8F7] p-4"
                  key={target.title}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-extrabold text-[#1F2933]">
                      {target.title}
                    </p>
                    <p className="shrink-0 text-sm font-extrabold text-[#2F7D57]">
                      {target.current} / {target.target}
                    </p>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#4FAE7B]"
                      style={{ width: target.progress }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {savingTags.map((tag) => (
                <div
                  className="rounded-[1.2rem] bg-[#F6F8F7] px-4 py-3 font-extrabold text-[#315E62]"
                  key={tag}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section
        className="mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center"
        id="cerita"
      >
        <Reveal>
          <p className="text-sm font-extrabold uppercase text-[#2B8B61]">
            Cerita dan edukasi
          </p>
          <h2 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">
            Suara asli pengguna dan edukasi sehat punya panggung sendiri.
          </h2>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#315E62]">
            Section ini disiapkan untuk testimoni real user dan video edukatif
            dari dokter, podcast kesehatan, atau figur publik yang relevan untuk
            anak muda.
          </p>
        </Reveal>

        <div className="grid gap-4">
          <Reveal
            className="rounded-[2rem] border border-[#E6F0EC] bg-white p-5 shadow-[0_26px_90px_rgba(6,61,67,0.07)]"
            delay={120}
          >
            <div className="grid gap-3 md:grid-cols-3">
              {testimonialPlaceholders.map((item) => (
                <div className="rounded-[1.6rem] bg-[#F7FBF9] p-5" key={item.title}>
                  <Quote className="size-6 text-[#4FAE7B]" />
                  <p className="mt-8 text-lg font-extrabold leading-7 text-[#1F555B]">
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

          <Reveal className="grid gap-4 md:grid-cols-3" delay={220}>
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
                <h3 className="mt-2 text-lg font-extrabold leading-6">{slot.title}</h3>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 py-24 sm:px-8"
        id="mulai"
      >
        <Reveal className="rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-7 text-white shadow-[0_30px_90px_rgba(6,61,67,0.22)] sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[#9DE5BD]">
                Mulai dengan ringan
              </p>
              <h2 className="mt-6 max-w-4xl text-5xl font-black leading-[1.06] sm:text-7xl">
                Satu absen jujur hari ini sudah cukup untuk mulai.
              </h2>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#EAF8F1]">
                Besok bisa lebih baik. Kalau belum, kamu tetap boleh kembali.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-80">
              <Link
                className="btn-brand-secondary min-h-14 rounded-full px-7 py-4 text-base"
                href="/register"
              >
                Buat akun
                <ArrowRight className="size-5" />
              </Link>
              <Link
                className="btn-brand-ghost min-h-12 rounded-full px-7 py-3"
                href="/login"
              >
                Masuk ke akun
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal
          className="mt-6 grid gap-4 md:grid-cols-3"
          delay={140}
        >
          <MiniCard
            icon={<ShieldCheck className="size-5" />}
            text="Privasi tetap nyaman. Kamu bisa tampil anonim di komunitas."
          />
          <MiniCard
            icon={<HeartHandshake className="size-5" />}
            text="Kambuh tidak dihukum. Aplikasi membantu kamu mulai lagi."
          />
          <MiniCard
            icon={<Sparkles className="size-5" />}
            text="Kartu perjalanan siap dibagikan saat kamu ingin merayakan progres."
          />
        </Reveal>
      </section>
    </main>
  );
}

function MiniCard({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-[1.6rem] border border-[#E6F0EC] bg-white p-5 shadow-[0_18px_55px_rgba(6,61,67,0.06)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E3F3F7] text-[#063D43]">
        {icon}
      </span>
      <p className="font-bold leading-7 text-[#315E62]">{text}</p>
    </div>
  );
}

function AppPreviewMockup() {
  const weekDays = [
    { day: 6, label: "Sen", tone: "green" },
    { day: 7, label: "Sel", tone: "green" },
    { day: 8, label: "Rab", tone: "yellow" },
    { day: 9, label: "Kam", tone: "gray" },
    { day: 10, label: "Jum", tone: "green" },
    { day: 11, label: "Sab", tone: "green" },
    { day: 12, label: "Min", tone: "red" },
  ] as const;

  const toneClass = {
    gray: "bg-[#EEF3F7] text-[#8AA0BC]",
    green: "bg-[#DDF4E9] text-[#117A54]",
    red: "bg-[#F8DEDE] text-[#BE4D55]",
    yellow: "bg-[#FFF2C7] text-[#A66D00]",
  } as const;

  return (
    <div className="relative mx-auto w-full max-w-[17.25rem] [perspective:1400px] sm:max-w-[18.5rem] lg:mx-0">
      <div
        aria-hidden="true"
        className="absolute -bottom-8 left-8 right-3 h-16 rounded-[999px] bg-black/25 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-5 -right-3 w-9 rounded-[2rem] bg-[#7EA4A0]/55 blur-[1px] [transform:rotateY(-14deg)]"
      />
      <div className="relative rounded-[2rem] bg-[#AFC9C5]/70 p-2.5 shadow-[0_34px_80px_rgba(0,0,0,0.22)] ring-1 ring-white/35 [transform:rotateX(3deg)_rotateY(-7deg)_rotateZ(1deg)]">
        <div className="absolute inset-x-10 top-2 h-1.5 rounded-full bg-white/55" />
        <div className="rounded-[1.55rem] bg-[#F7FAF8] p-3 text-[#10212B] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),0_1px_0_rgba(255,255,255,0.65)]">
          <div>
            <p className="text-[0.7rem] font-black uppercase text-[#4FAE7B]">
              Beranda
            </p>
            <h3 className="mt-2 text-base font-black leading-tight">
              Halo, Fawwaz. Satu keputusan kecil hari ini.
            </h3>
          </div>

          <div className="mt-3 rounded-[1.35rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-4 text-white shadow-[0_14px_34px_rgba(6,61,67,0.18)]">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[0.68rem] font-black text-[#B8F1CE]">
              Belum absen
            </span>
            <p className="mt-4 text-lg font-black leading-tight">
              Satu langkah kecil hari ini
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-200">
              Catat jujur. Tidak harus sempurna.
            </p>
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-center text-xs font-black text-[#123B3F] shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
              Absen Hari Ini
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <PreviewStat label="Rentetan" value="7 hari" />
            <PreviewStat label="Uang dihemat" value="Rp84rb" />
            <PreviewStat label="Batang" value="56" />
          </div>

          <div className="mt-3 rounded-[1.35rem] bg-white p-3 shadow-[0_12px_30px_rgba(6,61,67,0.07)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.68rem] font-black uppercase text-[#36798D]">
                  7 hari terakhir
                </p>
                <p className="mt-1 text-sm font-black">Progress ringkas</p>
              </div>
              <span className="rounded-full bg-[#DFF3E8] px-3 py-1 text-[0.68rem] font-black text-[#2F7D57]">
                Detail
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {weekDays.map((item) => (
                <div className="text-center" key={item.label}>
                  <span
                    className={`grid aspect-square place-items-center rounded-lg text-[0.62rem] font-black ${toneClass[item.tone]}`}
                  >
                    {item.day}
                  </span>
                  <p className="mt-1 text-[0.5rem] font-black text-[#9AA8BA]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-white p-2.5 shadow-sm">
      <p className="text-[0.58rem] font-bold leading-tight text-[#426070]">{label}</p>
      <p className="mt-1.5 text-xs font-black">{value}</p>
    </div>
  );
}

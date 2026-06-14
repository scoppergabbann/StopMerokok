import {
  BarChart3,
  BellRing,
  CalendarClock,
  CircleCheckBig,
  HandHeart,
  HomeIcon,
  PencilLine,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/reveal";

const features = [
  {
    title: "Absen harian",
    description:
      "Pilih bebas rokok, mengurangi, atau kambuh. Setelah tersimpan, ada perayaan lembut yang menghargai langkahmu.",
  },
  {
    title: "Komunitas suportif",
    description:
      "Bagikan progres singkat, beri semangat, dan ikuti tantangan 7, 30, hingga 90 hari tanpa merasa sendirian.",
  },
  {
    title: "Papan peringkat aktif",
    description:
      "Peringkat fokus pada rentetan bebas rokok yang masih aktif, jadi kompetisinya terasa adil dan sehat.",
  },
  {
    title: "Kalender dan rekam jejak",
    description:
      "Lihat bulan ini atau bulan sebelumnya, lengkap dengan warna status dan nama hari yang jelas.",
  },
  {
    title: "Penghematan jadi kebaikan",
    description:
      "Uang yang biasanya habis untuk rokok bisa diarahkan ke hadiah pribadi, keluarga, atau donasi.",
  },
  {
    title: "Pengingat dan bantuan dorongan",
    description:
      "Pengingat harian, timer 5 menit, napas pelan, dan bantuan kecil saat dorongan merokok muncul.",
  },
];

const stats = [
  { label: "Rentetan", value: "7 hari" },
  { label: "Uang dihemat", value: "Rp84rb" },
  { label: "Batang dihindari", value: "56" },
];

const supportSteps = [
  {
    title: "Catat hari ini dengan jujur",
    description:
      "Pilih kondisi hari ini. Bebas rokok, mengurangi, atau kambuh tetap jadi data untuk memahami diri.",
  },
  {
    title: "Rayakan langkah kecil",
    description:
      "Setelah absen, layar perayaan memberi apresiasi yang tenang, lencana pencapaian, dan target berikutnya.",
  },
  {
    title: "Kembali besok dengan arah",
    description:
      "Beranda menampilkan fokus hari ini, kalender, wawasan pemicu, komunitas, dan pengingat agar kebiasaan tetap hidup.",
  },
];

const previewFeatures = [
  {
    icon: CalendarClock,
    label: "Kalender",
    value: "Riwayat bulan lalu",
  },
  {
    icon: UsersRound,
    label: "Komunitas",
    value: "Tantangan 30 hari",
  },
  {
    icon: BarChart3,
    label: "Peringkat",
    value: "Rentetan aktif",
  },
  {
    icon: BellRing,
    label: "Pengingat",
    value: "20:00",
  },
];

const donationIdeas = [
  "Anak yatim",
  "Fakir miskin",
  "Lansia",
  "Keluarga",
  "Masjid",
  "Panti asuhan",
];

const calendarDays = [
  "free",
  "free",
  "reduced",
  "empty",
  "free",
  "relapsed",
  "free",
  "reduced",
  "free",
  "free",
  "empty",
  "free",
  "reduced",
  "free",
];

const statusClass = {
  free: "bg-[#DFF3E8] text-[#2F7D57]",
  reduced: "bg-[#FFF4CC] text-[#9B6B00]",
  relapsed: "bg-[#FBE3E3] text-[#B75D5D]",
  empty: "bg-slate-100 text-slate-400",
};

const bottomNavItems = [
  { label: "Beranda", icon: HomeIcon, active: true },
  { label: "Statistik", icon: BarChart3 },
  { label: "Absen", icon: CircleCheckBig, featured: true },
  { label: "Komunitas", icon: UsersRound },
  { label: "Berbagi", icon: HandHeart },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8F7] text-[#1F2933]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(31,41,51,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,41,51,0.045)_1px,transparent_1px)] bg-[size:24vw_100%,100%_9rem]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_20%_18%,rgba(79,174,123,0.15),transparent_28rem),radial-gradient(circle_at_85%_20%,rgba(123,183,201,0.14),transparent_24rem)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:min-h-screen lg:px-10">
        <p className="pointer-events-none absolute right-0 top-28 hidden text-[8rem] font-extrabold leading-none text-slate-900/[0.04] xl:block">
          LEGA
        </p>
        <nav className="animate-[fade-up_700ms_ease-out_both] flex items-center justify-between py-3">
          <a className="flex items-center gap-3" href="#">
            <Image
              alt="StopMerokok"
              className="size-12"
              height={48}
              src="/images/logo-noto-mark-transparent.png"
              width={48}
            />
            <span className="text-2xl font-extrabold tracking-normal">
              <span className="text-[#5DCB4F]">Stop</span>
              <span className="text-[#42A9E8]">Merokok</span>
            </span>
          </a>
          <a
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4FAE7B] hover:text-[#2F7D57]"
            href="/login"
          >
            Masuk
          </a>
        </nav>

        <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1fr_0.92fr] lg:py-20">
          <div className="animate-[fade-up_800ms_ease-out_120ms_both] max-w-3xl">
            <p className="mb-5 inline-flex rounded-full bg-[#E3F3F7] px-4 py-2 text-sm font-semibold text-[#36798D]">
              Pelacak berhenti merokok yang suportif, bukan menghakimi.
            </p>
            <h1 className="max-w-4xl text-[3.25rem] font-extrabold leading-[1.02] tracking-normal text-[#18212B] sm:text-6xl lg:text-[5.75rem]">
              Berhenti merokok tidak harus sendirian.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
              Absen harian, perayaan yang tenang, komunitas suportif,
              papan peringkat rentetan aktif, pengingat, dan pelacak penghematan
              yang bisa diarahkan ke hadiah atau donasi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="btn-brand-primary min-h-12 px-6 py-3 text-base"
                href="/register"
              >
                Mulai gratis hari ini
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-extrabold text-slate-700 shadow-sm transition hover:border-[#7BB7C9] hover:text-[#36798D]"
                href="#fitur"
              >
                Lihat fitur utama
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {previewFeatures.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur"
                    key={item.label}
                  >
                    <Icon className="size-5 text-[#4FAE7B]" />
                    <p className="mt-3 text-xs font-bold text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="animate-[fade-up_800ms_ease-out_260ms_both] relative">
            <div className="mx-auto max-w-md rounded-[2rem] border border-white/80 bg-white p-3 shadow-2xl shadow-slate-200/80">
              <div className="relative overflow-hidden rounded-[1.65rem] bg-[#F6F8F7] p-4 pb-28">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">
                    Halo Fawwaz,
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-normal">
                    Gimana kabarmu hari ini?
                  </h2>
                  <div className="mt-5 rounded-3xl bg-[#DFF3E8] p-4">
                    <p className="text-sm font-semibold text-[#2F7D57]">
                      Status hari ini
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-[#1F2933]">
                      Belum absen
                    </p>
                    <button className="btn-brand-primary mt-4 w-full px-4 py-3">
                      Absen Hari Ini
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-3xl bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-extrabold">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-3xl bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-extrabold">Progres Mei</p>
                    <span className="text-sm font-semibold text-slate-500">
                      12/30 hari
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((status, index) => (
                      <span
                        className={`grid aspect-square place-items-center rounded-xl text-xs font-bold ${
                          statusClass[status as keyof typeof statusClass]
                        }`}
                        key={`${status}-${index}`}
                      >
                        {index + 1}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-[#E3F3F7] p-5">
                  <p className="text-sm font-bold text-[#36798D]">
                    Motivasi hari ini
                  </p>
                  <p className="mt-2 text-base font-semibold leading-7">
                    Hari ke-7 tercatat. Satu hari lagi, satu napas lebih lega.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-white p-4">
                    <PencilLine className="size-5 text-[#4FAE7B]" />
                    <p className="mt-3 text-xs font-bold text-slate-500">
                      Fokus
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      Target hari ini
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-4">
                    <UsersRound className="size-5 text-[#36798D]" />
                    <p className="mt-3 text-xs font-bold text-slate-500">
                      Komunitas
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      4 peserta aktif
                    </p>
                  </div>
                </div>

                <div className="absolute inset-x-3 bottom-3">
                  <div className="relative grid h-20 grid-cols-5 items-center rounded-[1.75rem] border border-slate-100 bg-white px-2 py-2 shadow-xl shadow-slate-200/80">
                    {bottomNavItems.map((item) => {
                      const Icon = item.icon;

                      if (item.featured) {
                        return (
                          <a
                            aria-label="Absen harian"
                            className="group relative flex min-w-0 items-center justify-center"
                            href="/check-in"
                            key={item.label}
                          >
                            <span className="absolute -top-12 grid size-[4.35rem] place-items-center rounded-full bg-[#123B3F] text-white shadow-xl shadow-[#123B3F]/25 ring-8 ring-[#F6F8F7] transition group-hover:-translate-y-0.5">
                              <Icon aria-hidden="true" className="size-7" />
                            </span>
                            <span className="sr-only">{item.label}</span>
                          </a>
                        );
                      }

                      return (
                        <a
                          className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl py-1 text-[10px] font-bold transition ${
                            item.active
                              ? "text-[#1F2933]"
                              : "text-slate-400 hover:text-[#4FAE7B]"
                          }`}
                          href="#"
                          key={item.label}
                        >
                          <Icon aria-hidden="true" className="size-5" />
                          <span>{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="fitur"
        className="relative z-10 border-y border-slate-200 bg-white px-5 py-28 sm:px-8"
      >
        <p className="pointer-events-none absolute -right-6 top-10 hidden text-[7rem] font-extrabold leading-none text-slate-900/[0.035] lg:block">
          CHECK-IN
        </p>
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-normal text-[#4FAE7B]">
              Cara kerjanya
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
              Sistem sederhana untuk hari-hari yang tidak selalu mudah.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal
                className="rounded-3xl border border-slate-100 bg-[#F6F8F7] p-6"
                delay={index * 70}
                key={feature.title}
              >
                <h3 className="text-xl font-extrabold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#F6F8F7]/92 px-5 py-28 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1fr]">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-normal text-[#36798D]">
              Kenapa ini ada
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
              Banyak orang tidak butuh ceramah. Mereka butuh tempat mencatat,
              memahami pola, dan mulai lagi.
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              "Rentetan bebas rokok yang tetap terasa suportif.",
              "Layar perayaan setelah absen tanpa terasa berlebihan.",
              "Komunitas dengan dukungan singkat dan tantangan bersama.",
              "Papan peringkat khusus rentetan aktif agar kompetisinya sehat.",
              "Pelacak penghematan multi target untuk hadiah pribadi dan donasi.",
              "Pengingat harian agar kebiasaan absen makin konsisten.",
            ].map((item) => (
              <Reveal className="rounded-3xl bg-white p-5 shadow-sm" key={item}>
                <p className="font-semibold leading-7 text-slate-700">{item}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-white px-5 py-28 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(31,41,51,0.05)_1px,transparent_1px)] bg-[size:25%_100%]" />
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-normal text-[#4FAE7B]">
              Alur harian
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
              Dibuat untuk dibuka sebentar, tapi terasa menemani.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {supportSteps.map((step, index) => (
              <Reveal
                className="rounded-3xl border border-slate-100 bg-[#F6F8F7] p-7"
                delay={index * 90}
                key={step.title}
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-[#DFF3E8] text-base font-extrabold text-[#2F7D57]">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#F6F8F7]/92 px-5 py-28 sm:px-8">
        <p className="pointer-events-none absolute left-4 top-8 hidden text-[6rem] font-extrabold leading-none text-slate-900/[0.035] lg:block">
          BERBAGI
        </p>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-normal text-[#36798D]">
              Penghematan jadi kebaikan
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-normal sm:text-4xl">
              Uang yang biasanya hilang bisa berubah jadi target yang terlihat.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              Buat beberapa target sekaligus, lihat kemajuan per target, lalu
              catat riwayat saat penghematan benar-benar dialokasikan.
            </p>
          </Reveal>

          <Reveal className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="rounded-3xl bg-[#DFF3E8] p-5">
              <p className="text-sm font-bold text-[#2F7D57]">
                Simulasi bulan ini
              </p>
              <p className="mt-2 text-4xl font-extrabold">Rp184.000</p>
              <p className="mt-2 font-medium text-slate-600">
                Bisa kamu simpan, rayakan, atau bagikan.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Donasi anak yatim", "Rp40.000 / Rp100.000"],
                ["Traktir keluarga", "Rp75.000 / Rp150.000"],
              ].map(([title, progress]) => (
                <div className="rounded-2xl bg-[#F6F8F7] p-4" key={title}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold">{title}</p>
                    <p className="text-sm font-bold text-[#2F7D57]">
                      {progress}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full w-2/5 rounded-full bg-[#4FAE7B]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {donationIdeas.map((idea) => (
                <div
                  className="rounded-2xl border border-slate-100 bg-[#F6F8F7] px-4 py-3 text-sm font-extrabold text-slate-700"
                  key={idea}
                >
                  {idea}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 bg-[#1F2933] px-5 py-20 text-white sm:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-normal text-[#9DE5BD]">
            Mulai dari satu hari
          </p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-normal sm:text-5xl">
            Mulai dari satu absen jujur hari ini.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Tidak perlu menunggu siap total. Catat dulu, pahami polanya, lalu
            mulai lagi dengan lebih sadar.
          </p>
          <a
            className="btn-brand-primary mt-8 min-h-12 px-7 py-3 shadow-black/20"
            href="/register"
          >
            Buat akun dan mulai
          </a>
        </Reveal>
      </section>

      <footer className="relative z-10 bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Image
              alt="StopMerokok"
              className="size-11"
              height={44}
              src="/images/logo-noto-mark-transparent.png"
              width={44}
            />
            <p className="mt-2 text-lg font-extrabold">
              <span className="text-[#5DCB4F]">Stop</span>
              <span className="text-[#42A9E8]">Merokok</span>
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Teman harian untuk berhenti merokok dengan lebih manusiawi.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
            <a className="hover:text-[#4FAE7B]" href="#fitur">
              Fitur
            </a>
            <a className="hover:text-[#4FAE7B]" href="/login">
              Masuk
            </a>
            <a className="hover:text-[#4FAE7B]" href="/register">
              Daftar
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

import {
  ArrowLeft,
  Database,
  EyeOff,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const privacyCards = [
  {
    body: "Nama panggilan, email akun, target berhenti, alasan berhenti, baseline rokok, check-in harian, jurnal, dan preferensi pengingat.",
    icon: Database,
    title: "Data yang disimpan",
  },
  {
    body: "Data dipakai untuk menghitung progress, rentetan, penghematan, insight pribadi, reminder, dan pengalaman aplikasi yang lebih relevan.",
    icon: HeartHandshake,
    title: "Kenapa data dipakai",
  },
  {
    body: "StopMerokok tidak dibuat untuk menjual data pribadi, menampilkan identitasmu tanpa izin, atau menghakimi perjalananmu.",
    icon: EyeOff,
    title: "Yang tidak kami lakukan",
  },
  {
    body: "Data akun dan progress disimpan melalui Supabase. Di komunitas, kamu bisa menjaga tampilan identitas agar tetap nyaman.",
    icon: LockKeyhole,
    title: "Keamanan dasar",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#F7FBF9_0%,#EEF8F5_48%,#F7FBFF_100%)] px-5 py-6 text-[#1F2933]">
      <section className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="StopMerokok"
              className="size-10"
              height={40}
              priority
              src="/images/logo-noto-mark-transparent.png"
              width={40}
            />
            <span className="text-lg font-extrabold">
              <span className="text-[#5DCB4F]">Stop</span>
              <span className="text-[#42A9E8]">Merokok</span>
            </span>
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 shadow-sm"
            href="/login"
          >
            Masuk
          </Link>
        </nav>

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#123B3F_0%,#1F555B_58%,#4FAE7B_145%)] p-6 text-white shadow-xl shadow-slate-300/70 sm:p-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-extrabold text-[#B8F1CE]"
            href="/"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
          <p className="mt-10 text-sm font-extrabold uppercase text-[#B8F1CE]">
            Privasi & Keamanan
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Progress berhenti merokok itu personal. Datamu harus diperlakukan
            dengan hormat.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-200">
            Halaman ini menjelaskan dengan bahasa sederhana data apa yang
            disimpan StopMerokok, kenapa dipakai, dan batasan yang kami jaga.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {privacyCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-sm backdrop-blur"
                key={item.title}
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
                  <Icon className="size-6" />
                </span>
                <h2 className="mt-5 text-2xl font-extrabold">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold">Prinsip sederhana kami</h2>
            <div className="mt-5 space-y-3">
              <PolicyRow text="Data rokok dan check-in dipakai untuk membantu kamu melihat progres, bukan untuk menilai kamu." />
              <PolicyRow text="Komunitas dirancang agar tetap suportif. Jangan bagikan data pribadi yang kamu tidak nyaman tampilkan." />
              <PolicyRow text="Feedback dan bug report dipakai untuk memperbaiki aplikasi dan menyiapkan admin panel." />
              <PolicyRow text="Jika nanti ada perubahan besar soal penggunaan data, copy privasi ini harus diperbarui sebelum fitur dirilis." />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#BFE7D1] bg-[#F7FBF9] p-6">
            <ShieldCheck className="size-8 text-[#2F7D57]" />
            <h2 className="mt-5 text-2xl font-extrabold">
              Ada pertanyaan atau merasa tidak nyaman?
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Kirim laporan dari halaman feedback. Kalau perlu, tinggalkan
              kontak agar bisa dihubungi balik.
            </p>
            <Link
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white"
              href="/feedback"
            >
              Buka feedback
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-semibold text-slate-500">
          Terakhir diperbarui: Juni 2026. Ini bukan nasihat hukum, tapi komitmen
          produk yang akan dirapikan seiring StopMerokok berkembang.
        </p>
      </section>
    </main>
  );
}

function PolicyRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#F6F8F7] p-4">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#DFF3E8] text-[#2F7D57]">
        <ShieldCheck className="size-4" />
      </span>
      <p className="font-semibold leading-7 text-slate-700">{text}</p>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

type AuthCardProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
  subtitle: string;
  title: string;
};

export function AuthCard({ children, footer, subtitle, title }: AuthCardProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F6F8F7] px-5 py-10 text-[#1F2933]">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-200/80">
        <Link className="mb-8 flex items-center justify-center gap-3" href="/">
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
        </Link>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 leading-7 text-slate-600">{subtitle}</p>
        {children}
        <div className="mt-6 text-center text-sm font-semibold text-slate-500">
          {footer}
        </div>
      </div>
    </main>
  );
}

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
        <Link className="mb-8 flex items-center gap-3" href="/">
          <span className="grid size-10 place-items-center rounded-2xl bg-[#4FAE7B] font-extrabold text-white">
            S
          </span>
          <span className="font-extrabold">StopMerokok</span>
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

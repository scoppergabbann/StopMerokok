import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  body: string;
  icon: LucideIcon;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  body,
  icon: Icon,
  secondaryHref,
  secondaryLabel,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#BFE7D1] bg-[#F7FBF9] p-5 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#DFF3E8] text-[#2F7D57]">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-xl font-extrabold text-[#1F2933]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">{body}</p>
      {(actionHref && actionLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {actionHref && actionLabel ? (
            <Link
              className="inline-flex justify-center rounded-2xl bg-[#4FAE7B] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#4FAE7B]/20"
              href={actionHref}
            >
              {actionLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link
              className="inline-flex justify-center rounded-2xl bg-white px-5 py-3 font-extrabold text-slate-600 shadow-sm"
              href={secondaryHref}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

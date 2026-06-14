"use client";

import { Copy, Download, Share2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildShareCardSvg,
  getShareCaption,
  shareCardTemplates,
  type ShareCardData,
  type ShareCardPrivacy,
  type ShareCardTemplate,
} from "@/lib/share-card";

type ShareCardPreviewProps = {
  data: ShareCardData;
  onCopyCaption?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
};

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function svgToPngBlob(svg: string) {
  const image = new Image();
  const url = svgToDataUrl(svg);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas tidak tersedia di browser ini.");
  }

  context.drawImage(image, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Gagal membuat PNG."));
      }
    }, "image/png");
  });
}

export function ShareCardPreview({
  data,
  onCopyCaption,
  onDownload,
  onShare,
}: ShareCardPreviewProps) {
  const [template, setTemplate] = useState<ShareCardTemplate>("daily");
  const [privacy, setPrivacy] = useState<ShareCardPrivacy>({
    showName: true,
    showNumbers: true,
  });
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState("");

  const svg = useMemo(
    () => buildShareCardSvg(template, data, privacy),
    [data, privacy, template],
  );
  const caption = useMemo(
    () => getShareCaption(template, data, privacy),
    [data, privacy, template],
  );
  const previewUrl = useMemo(() => svgToDataUrl(svg), [svg]);

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setStatus("Caption disalin.");
    onCopyCaption?.();
  }

  async function downloadPng() {
    setIsWorking(true);
    setStatus("");

    try {
      const blob = await svgToPngBlob(svg);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kartu-perjalanan-${template}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("PNG berhasil diunduh.");
      onDownload?.();
    } catch {
      setStatus("Gagal membuat PNG. Coba gunakan browser lain.");
    } finally {
      setIsWorking(false);
    }
  }

  async function shareCard() {
    setIsWorking(true);
    setStatus("");

    try {
      const blob = await svgToPngBlob(svg);
      const file = new File([blob], `kartu-perjalanan-${template}.png`, {
        type: "image/png",
      });
      const sharePayload = {
        files: [file],
        text: caption,
        title: "Kartu Perjalanan StopMerokok",
      };

      if (navigator.share && navigator.canShare?.(sharePayload)) {
        await navigator.share(sharePayload);
        setStatus("Kartu siap dibagikan.");
        onShare?.();
      } else if (navigator.share) {
        await navigator.share({
          text: caption,
          title: "Kartu Perjalanan StopMerokok",
          url: window.location.origin,
        });
        setStatus("Caption dan link dibagikan. Gambar bisa diunduh terpisah.");
        onShare?.();
      } else {
        await navigator.clipboard.writeText(caption);
        setStatus("Web Share belum tersedia. Caption sudah disalin.");
      }
    } catch {
      setStatus("Share dibatalkan atau belum didukung browser ini.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(340px,0.56fr)] xl:items-start">
      <div className="rounded-[2rem] border border-[#DFF3E8] bg-white p-3 shadow-xl shadow-slate-200/70 sm:p-5">
        <div className="mx-auto aspect-video w-full max-w-[min(760px,92vw)] overflow-hidden rounded-[1.35rem] bg-[#F7FBF9] shadow-inner xl:max-w-[780px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Preview Kartu Perjalanan"
            className="h-full w-full object-contain"
            src={previewUrl}
          />
        </div>
      </div>

      <aside className="space-y-4 pb-28 xl:pb-0">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Template
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {shareCardTemplates.map((item) => (
              <button
                className={`rounded-2xl border p-4 text-left transition ${
                  template === item.value
                    ? "border-[#4FAE7B] bg-[#DFF3E8]"
                    : "border-slate-100 bg-[#F6F8F7] hover:border-[#BFE7D1]"
                }`}
                key={item.value}
                onClick={() => setTemplate(item.value)}
                type="button"
              >
                <span className="block font-extrabold">{item.label}</span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#4FAE7B]" />
            <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
              Privasi
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-[#F6F8F7] p-4 font-bold">
              Tampilkan nama
              <input
                checked={privacy.showName}
                className="size-5 accent-[#4FAE7B]"
                onChange={(event) =>
                  setPrivacy((current) => ({
                    ...current,
                    showName: event.target.checked,
                  }))
                }
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-[#F6F8F7] p-4 font-bold">
              Tampilkan angka
              <input
                checked={privacy.showNumbers}
                className="size-5 accent-[#4FAE7B]"
                onChange={(event) =>
                  setPrivacy((current) => ({
                    ...current,
                    showNumbers: event.target.checked,
                  }))
                }
                type="checkbox"
              />
            </label>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
            Bagikan seperlunya. Jaga privasimu tetap nyaman.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-sm font-extrabold uppercase text-[#4FAE7B]">
            Caption
          </p>
          <p className="mt-3 rounded-2xl bg-[#F6F8F7] p-4 text-sm font-semibold leading-6 text-slate-600">
            {caption}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <button
              className="btn-brand-primary disabled:opacity-60"
              disabled={isWorking}
              onClick={shareCard}
              type="button"
            >
              <Share2 className="size-4" />
              Bagikan
            </button>
            <button
              className="btn-brand-secondary"
              disabled={isWorking}
              onClick={downloadPng}
              type="button"
            >
              <Download className="size-4" />
              Download PNG
            </button>
            <button
              className="btn-brand-secondary"
              onClick={copyCaption}
              type="button"
            >
              <Copy className="size-4" />
              Copy Caption
            </button>
          </div>
          {status && (
            <p className="mt-3 text-sm font-bold text-[#36798D]">{status}</p>
          )}
        </div>
      </aside>
    </section>
  );
}

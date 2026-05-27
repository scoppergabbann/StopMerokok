StopRokok Brand Assets
=======================

Isi folder ini dibuat agar bisa langsung dipakai di project Next.js.

File utama:
- favicon.ico
- favicon.svg
- apple-touch-icon.png
- icon-192.png
- icon-512.png
- logo-noto-header-transparent.png       : logo horizontal pendek untuk navbar/header
- logo-noto-horizontal-transparent.png   : logo horizontal lengkap dengan tagline
- logo-noto-mark-transparent.png         : icon/logo mark saja
- logo-noto-transparent.png              : logo utama dengan tagline
- logo-noto-showcase-dark.png            : preview logo di background gelap
- og-image.png                           : gambar Open Graph untuk share link
- manifest.webmanifest

Cara pakai di Next.js App Router:
1. Copy semua file ke folder: public/brand/
2. Untuk favicon/app icon, copy juga file berikut ke folder app/ atau public/ sesuai struktur project:
   - favicon.ico
   - apple-touch-icon.png
   - icon-192.png
   - icon-512.png
   - manifest.webmanifest

Contoh metadata di app/layout.tsx:

export const metadata = {
  title: "StopRokok",
  description: "Catat progress harianmu dan bangun hidup bebas rokok satu hari demi satu hari.",
  manifest: "/brand/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon.ico" },
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "StopRokok",
    description: "Better breath. Better life.",
    images: ["/brand/og-image.png"],
  },
}

Contoh logo navbar:

import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/brand/logo-noto-header-transparent.png"
      alt="StopRokok"
      width={192}
      height={40}
      priority
    />
  );
}

Catatan:
- PNG sudah transparent, aman untuk background terang.
- SVG tersedia jika ingin kualitas paling tajam di semua ukuran.
- Untuk favicon kecil, gunakan favicon.ico atau favicon.svg.

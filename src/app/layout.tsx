import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import { NotificationReminder } from "@/components/notification-reminder";
import { PwaBootstrap } from "@/components/pwa-bootstrap";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://stopmerokok.vercel.app",
  ),
  title: {
    default: "StopMerokok | Teman Berhenti Merokok Harian",
    template: "%s | StopMerokok",
  },
  description:
    "Catat progres berhenti merokok, bangun rentetan harian, lihat uang yang kamu hemat, dan mulai lagi tanpa dihakimi.",
  applicationName: "StopMerokok",
  authors: [{ name: "StopMerokok" }],
  category: "health",
  creator: "StopMerokok",
  icons: {
    apple: "/images/apple-touch-icon.png",
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/images/favicon.svg", type: "image/svg+xml" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/images/favicon.ico",
  },
  keywords: [
    "berhenti merokok",
    "stop merokok",
    "tracker rokok",
    "rentetan berhenti merokok",
    "penghematan rokok",
    "dorongan merokok",
  ],
  manifest: "/manifest.webmanifest",
  openGraph: {
    description:
      "Teman harian untuk absen berhenti merokok, melihat progres, penghematan, dan motivasi tanpa rasa dihakimi.",
    images: [
      {
        alt: "StopMerokok - Berhenti merokok tidak harus sendirian",
        height: 630,
        url: "/images/og-image.png",
        width: 1200,
      },
    ],
    locale: "id_ID",
    siteName: "StopMerokok",
    title: "StopMerokok | Berhenti Merokok Tidak Harus Sendirian",
    type: "website",
    url: "/",
  },
  publisher: "StopMerokok",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    index: true,
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Absen harian, rentetan, pelacak penghematan, bantuan dorongan merokok, dan motivasi suportif untuk berhenti merokok.",
    images: ["/images/og-image.png"],
    title: "StopMerokok | Teman Berhenti Merokok Harian",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StopMerokok",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F8F7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <PwaBootstrap />
          <NotificationReminder />
          <PwaInstallPrompt />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import { NotificationReminder } from "@/components/notification-reminder";
import { PwaBootstrap } from "@/components/pwa-bootstrap";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StopMerokok | Teman berhenti merokok harian",
  description:
    "Catat progress harian, lihat uang yang kamu hemat, dan bangun kebiasaan baru satu hari demi satu hari.",
  applicationName: "StopMerokok",
  manifest: "/manifest.webmanifest",
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
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

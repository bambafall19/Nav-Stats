import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Roboto_Mono } from "next/font/google";
import "./globals.css";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import PushNotificationManager from "@/components/shared/PushNotificationManager";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NavéStats – Pronostics & Statistiques Navétanes Khombole",
  description:
    "La première plateforme communautaire dédiée aux pronostics et statistiques des Navétanes de Khombole. Pronostique les matchs, gagne des points et grimpe dans le classement !",
  keywords: ["navétanes", "khombole", "football", "pronostics", "statistiques", "sénégal"],
  authors: [{ name: "NavéStats" }],
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "NavéStats – Pronostics Navétanes Khombole",
    description: "Plateforme communautaire de pronostics et statistiques des Navétanes de Khombole",
    type: "website",
    locale: "fr_FR",
  },
  manifest: "/manifest.json",
  verification: {
    google: "rIn2jCO3ijj7ERy1CEzbX57druczxj1ZbLv52lwcx88",
  },
};

export const viewport: Viewport = {
  themeColor: "#006233",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable} ${robotoMono.variable}`} suppressHydrationWarning>
      <body className="font-inter antialiased bg-surface text-text-primary">
        <ErrorBoundary>
          {children}
          <PWAInstallBanner />
          <OfflineIndicator />
          <PushNotificationManager />
        </ErrorBoundary>
      </body>
    </html>
  );
}

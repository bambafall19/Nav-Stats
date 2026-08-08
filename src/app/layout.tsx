import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { FCMProvider } from "@/components/shared/FCMProvider";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import GoogleTagManager from "@/components/shared/GoogleTagManager";
import GoogleTagManagerNoScript from "@/components/shared/GoogleTagManagerNoScript";
import { ToastProvider } from "@/components/shared/Toast";
import { PageTransitionLayout } from "@/components/shared/PageTransition";
import { MatchNotificationService } from "@/components/shared/MatchNotificationService";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://navestats.site"),
  title: {
    default: "NavéStats – Pronostics & Statistiques Navétanes Khombole",
    template: "%s · NavéStats",
  },
  description:
    "La première plateforme communautaire dédiée aux pronostics et statistiques des Navétanes de Khombole. Pronostique les matchs, gagne des points et grimpe dans le classement !",
  keywords: ["navétanes", "khombole", "football", "pronostics", "statistiques", "sénégal"],
  authors: [{ name: "NavéStats" }],
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "NavéStats – Pronostics & Statistiques Navétanes Khombole",
    description: "Plateforme communautaire de pronostics et statistiques des Navétanes de Khombole. Pronostique, gagne des points, grimpe au classement !",
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "NavéStats",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "NavéStats – Pronostics & Statistiques Navétanes Khombole",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NavéStats – Pronostics & Statistiques Navétanes Khombole",
    description: "Pronostics, scores et classements des Navétanes de Khombole. Rejoins la communauté !",
    images: ["/og.png"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "rIn2jCO3ijj7ERy1CEzbX57druczxj1ZbLv52lwcx88",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#050a08" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${dancingScript.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <GoogleTagManager />
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "NavéStats",
                  url: "https://navestats.site",
                  description: "Pronostics, scores et statistiques des Navétanes de Khombole (Zone 6).",
                  inLanguage: ["fr", "wo"],
                },
                {
                  "@type": "Organization",
                  name: "NavéStats",
                  url: "https://navestats.site",
                  logo: "https://navestats.site/icons/icon-512.png",
                  sameAs: [],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-inter antialiased">
        <GoogleTagManagerNoScript />
        <ToastProvider>
          <ErrorBoundary>
            <LanguageProvider>
              <MatchNotificationService />
              <PageTransitionLayout>
                {children}
              </PageTransitionLayout>
              <PWAInstallBanner />
              <OfflineIndicator />
              <FCMProvider />
            </LanguageProvider>
          </ErrorBoundary>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}

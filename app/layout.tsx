import type { Metadata } from "next";
import {
  Geist_Mono,
  Inter,
  IBM_Plex_Sans_Arabic,
  Source_Serif_4,
} from "next/font/google";
import { I18nProvider } from "@/components/I18nProvider";
import { LocaleAwareToaster } from "@/components/LocaleAwareToaster";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Property-Agent — AI broker for WhatsApp",
  description:
    "AI-powered WhatsApp lead engine for real-estate brokers. Connect inventory, capture leads, never miss a customer.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistMono.variable} ${inter.variable} ${plexArabic.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-dvh">
        <I18nProvider>
          {children}
          <LocaleAwareToaster />
        </I18nProvider>
      </body>
    </html>
  );
}

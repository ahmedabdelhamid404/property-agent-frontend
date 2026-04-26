import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  IBM_Plex_Sans_Arabic,
  Source_Serif_4,
} from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

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
  title: "Property-Agent — وكيلك العقاري الذكي",
  description:
    "AI-powered WhatsApp assistant for Egyptian real-estate brokers. Connect inventory, capture leads, never miss a customer.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geist.variable} ${geistMono.variable} ${inter.variable} ${plexArabic.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-dvh">
        {children}
        <Toaster
          position="bottom-center"
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "var(--font-arabic)",
              background: "var(--color-paper-cream)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-rule)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-card)",
            },
          }}
        />
      </body>
    </html>
  );
}

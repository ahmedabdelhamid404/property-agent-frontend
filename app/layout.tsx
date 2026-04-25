import type { Metadata } from "next";
import { Amiri, EB_Garamond, Markazi_Text } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const markazi = Markazi_Text({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-markazi",
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
      className={`${amiri.variable} ${garamond.variable} ${markazi.variable}`}
    >
      <body className="min-h-dvh">
        {children}
        <Toaster
          position="bottom-center"
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              background: "var(--color-paper-cream)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-rule-strong)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-card)",
            },
          }}
        />
      </body>
    </html>
  );
}

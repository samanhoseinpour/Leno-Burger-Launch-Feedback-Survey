import type { Metadata, Viewport } from "next";
import { Vazirmatn, Archivo_Black, JetBrains_Mono } from "next/font/google";
import { IosScrollIndicator } from "@/components/IosScrollIndicator";
import { NOINDEX_ROBOTS, SEARCH_INDEXING } from "@/lib/seo";
import "./globals.css";

// Vazirmatn — all Persian body/UI text (variable weight range).
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

// Archivo Black — the "Leno" wordmark only (stays LTR).
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

// JetBrains Mono — small numeric/data accents (e.g. admin stats).
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  // Brand-generic default; the survey supplies its own title/description on
  // /survey, and /menu on /menu. The home page (/) inherits this.
  title: "لنو",
  description: "به لنو خوش آمدید — منو و نظرسنجی مجموعه‌ی لنو.",
  // Inherited by every page, so the whole site stays out of search while we are
  // on a temporary domain. Child pages that set `robots` override this.
  robots: SEARCH_INDEXING ? undefined : NOINDEX_ROBOTS,
};

export const viewport: Viewport = {
  themeColor: "#b91c1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${archivoBlack.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh">
        {children}
        <IosScrollIndicator />
      </body>
    </html>
  );
}

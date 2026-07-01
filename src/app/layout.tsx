import type { Metadata, Viewport } from "next";
import { Vazirmatn, Archivo_Black, JetBrains_Mono } from "next/font/google";
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
  title: "لنو | نظرسنجی افتتاحیه",
  description:
    "حضور شما مایه‌ی افتخار ماست؛ چند لحظه وقت بگذارید و نظر ارزشمندتان را با ما در میان بگذارید.",
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
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}

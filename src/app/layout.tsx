import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/context/MusicContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kartik Khajuria — World-Class Creative Developer & Full-Stack Architect",
  description:
    "Next-generation digital experiences, interactive WebGL 3D computing, fluid design systems, and scalable cloud platforms crafted with Silicon Valley caliber precision.",
};

export const viewport: Viewport = {
  themeColor: "#080D1B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. "crxlauncher") inject
    // attributes onto <html> before hydration, which is outside app control.
    // This only silences mismatches for this element's own attributes.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${interSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080D1B] text-[#F8FAFC] selection:bg-[#5145E5] selection:text-white">
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}

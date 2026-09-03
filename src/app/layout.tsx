import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import { BookmarkProvider } from "@/context/BookmarkContext";
import BookmarkDrawer from "@/components/BookmarkDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "Tartil Qur'an - Baca AlQuran Digital",
  description: "Baca AlQuran digital dengan terjemahan, audio berkualitas, dan tafsir lengkap.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tartil Qur'an",
  },
};

export const viewport: Viewport = {
  themeColor: "#022c22",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${amiri.variable} font-sans antialiased bg-gradient-to-br from-emerald-50 to-teal-100 min-h-screen text-emerald-950 dark:from-teal-950 dark:to-emerald-900 dark:text-emerald-50`}
      >
        <BookmarkProvider>
          {children}
          <BookmarkDrawer />
        </BookmarkProvider>
      </body>
    </html>
  );
}

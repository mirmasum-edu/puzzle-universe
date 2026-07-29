import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://puzzle-universe.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Puzzle Universe — Play 6 Free Puzzle Games",
    template: "%s · Puzzle Universe",
  },
  description:
    "Puzzle Universe is a polished puzzle game platform with six free games — Grid Block Puzzle, Memory Match, 2048, Sliding Puzzle, Sudoku and Color Flood. Climb global leaderboards, unlock achievements and complete daily missions. For ages 4+.",
  applicationName: "Puzzle Universe",
  keywords: [
    "puzzle games",
    "block puzzle",
    "2048",
    "sudoku",
    "memory match",
    "sliding puzzle",
    "color flood",
    "brain games",
    "casual games",
  ],
  authors: [{ name: "Puzzle Universe" }],
  creator: "Puzzle Universe",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Puzzle Universe — Play 6 Free Puzzle Games",
    description:
      "Six polished puzzle games, one account. Leaderboards, achievements, daily missions and more. Play free, ages 4+.",
    siteName: "Puzzle Universe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Puzzle Universe — Play 6 Free Puzzle Games",
    description:
      "Six polished puzzle games, one account. Leaderboards, achievements and daily missions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

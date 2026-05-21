import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030014",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ASH-TEROIDS | Experiments by Ashish",
  description:
    "An interactive universe of projects, experiments, and ideas — orbiting one developer.",
  keywords: [
    "Ashish",
    "portfolio",
    "developer",
    "software engineer",
    "projects",
    "ash-teroids",
  ],
  openGraph: {
    title: "ASH-TEROIDS | Experiments by Ashish",
    description:
      "An interactive universe of projects, experiments, and ideas — orbiting one developer.",
    type: "website",
    siteName: "ASH-TEROIDS",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASH-TEROIDS | Experiments by Ashish",
    description:
      "An interactive universe of projects, experiments, and ideas — orbiting one developer.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}

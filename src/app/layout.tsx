import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Studyline", template: "%s · Studyline" },
  description: "Learn chapter by chapter, practise, take tests and track your progress.",
  manifest: "/manifest.webmanifest",
  applicationName: "Studyline",
};

export const viewport: Viewport = {
  themeColor: "#a85c40",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

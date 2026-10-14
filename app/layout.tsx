import type { Metadata, Viewport } from "next";
import { Special_Elite } from "next/font/google";
import "./globals.css";

const typewriterFont = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-type",
});

export const metadata: Metadata = {
  title: "Typewriter",
  description: "Un lugar tranquilo para escribir, como en una máquina de escribir.",
};

export const viewport: Viewport = {
  themeColor: "#1a1816",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={typewriterFont.variable}>
      <body>{children}</body>
    </html>
  );
}

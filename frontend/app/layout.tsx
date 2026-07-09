import type { Metadata } from "next";
import { Inter, Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Note: these variable names deliberately DON'T match Tailwind's theme
// keys (--font-sans etc.) — they're mapped to those keys inside the
// @theme block in globals.css instead, which avoids a circular reference.
const sans = Inter({ subsets: ["latin"], variable: "--font-body" });
const serif = Lora({ subsets: ["latin"], variable: "--font-display" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-data",
});

export const metadata: Metadata = {
  title: "AI Email Reply Assistant",
  description: "Draft clear, professional email replies in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
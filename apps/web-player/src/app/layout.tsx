import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "../../../../packages/ui/src/styles/globals.css";
import "../../../../packages/ui/src/styles/components.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arenax | Player Dashboard",
  description: "Player dashboard for Arenax MVP",
};

import { DevicePreview } from "@arenax/ui";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}>
        <DevicePreview>
          {children}
        </DevicePreview>
      </body>
    </html>
  );
}

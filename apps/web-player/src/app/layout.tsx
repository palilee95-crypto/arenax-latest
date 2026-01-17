import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "@arenax/ui/styles/globals.css";
import "@arenax/ui/styles/components.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arena X",
  description: "The ultimate sports community platform",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arena X",
  },
  icons: {
    apple: "/arenax-centered.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} `}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

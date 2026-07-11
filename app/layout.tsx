import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melanin Unity Clips",
  description: "A scroll-only video discovery app for creators, ideas, culture, lifestyle, and community-driven clips.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Melanin Unity Clips",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

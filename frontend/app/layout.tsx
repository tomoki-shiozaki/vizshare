import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ErrorProvider } from "@/context/error";
import { ClientProviders } from "@/app/providers/ClientProviders";
import { AppContent } from "@/app/components/AppContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vizshare",
  description:
    "Vizshare - CSV データをアップロードして可視化・共有できるプラットフォーム",
  icons: "./vizshare-logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#00aaff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorProvider>
          <ClientProviders>
            <AppContent>{children}</AppContent>
          </ClientProviders>
        </ErrorProvider>
      </body>
    </html>
  );
}

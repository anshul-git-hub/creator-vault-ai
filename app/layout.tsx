import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "CreatorVault AI | The Second Brain for Content Creators",
  description: "Securely upload, organize, search, and manage your scripts, thumbnail references, brand assets, and content ideas.",
};

import { Toaster } from 'sonner';
import { ActivityProvider } from '@/lib/activity';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ActivityProvider>
          {children}
          <Toaster theme="dark" position="top-right" />
        </ActivityProvider>
      </body>
    </html>
  );
}

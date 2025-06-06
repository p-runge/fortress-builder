import "@total-typescript/ts-reset";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCProvider } from "~/api/client";
import ThemeProvider from "~/components/theme-provider";
import { cn } from "~/lib/utils";
import "./globals.css";

// set up fontawesome icons and fix icon sizes
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Toaster } from "~/components/ui/sonner";
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fortress Builder",
  description: "This is a playground for building fortress-like structures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "bg-background text-foreground",
      )}
    >
      <body className="flex h-screen flex-col">
        <ThemeProvider>
          <SessionProvider>
            <TRPCProvider>
              {children}
              <Toaster />
            </TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

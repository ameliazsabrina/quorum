"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReduxProvider } from "@/store/provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/common/i18n-provider";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import AppCookiesProvider from "@/components/providers/cookies-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexo Next Dashboard",
  description: "A dashboard application built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


 


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppCookiesProvider>
           <ReactQueryProvider>
           <AuthProvider>
            <I18nProvider>
              {children}
              <Toaster />
            </I18nProvider>
          </AuthProvider>
         </ReactQueryProvider>
        </AppCookiesProvider>
        
       


      </body>
    </html>
  );
}

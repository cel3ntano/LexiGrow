import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { ReduxProvider } from "@/providers/redux-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "@/styles/fonts.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "LexiGrow - Learn English Words Effectively",
  description:
    "Add, learn and train new English words effectively with LexiGrow",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang='en' className='h-full'>
      <body className='min-h-full bg-background-page text-text-primary font-primary'>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}

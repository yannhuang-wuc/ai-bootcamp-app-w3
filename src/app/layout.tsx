import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WUC Todo v2-2026.02.06 10:23am",
  description: "Stay organized and productive with WUC Todo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakartaSans.variable} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
          {/* Aurora background effect */}
          <div className='aurora-bg' aria-hidden='true' />
          <div className='noise-overlay' aria-hidden='true' />
          <main className='relative'>
            {children}
            <Toaster />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

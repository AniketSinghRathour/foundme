import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Photo Recognition Platform",
  description: "Find yourself in every moment. Upload a selfie and get your matches instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-zinc-900 bg-[#FAF7F2]">
        <AppProviders>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}

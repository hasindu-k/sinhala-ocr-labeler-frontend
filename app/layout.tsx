import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToast } from "@/components/app-toast";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Sinhala OCR Dataset Builder | Upload, Label & Verify Text — SinhalaLearn OCR",
  description:
    "A Sinhala handwriting OCR platform to upload PDFs, extract line images, correct text, verify annotations, and export training datasets. Built for dataset creation, research, and Sinhala AI development.",
  keywords: [
    "Sinhala OCR",
    "OCR Dataset",
    "Sinhala handwriting recognition",
    "OCR labeling tool",
    "Sinhala AI",
    "dataset builder",
    "text recognition Sinhala",
    "PDF OCR Sinhala",
    "SinhalaLearn",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ocr.sinhalalearn.online",
    siteName: "sinhalalearn.online",
    title:
      "Sinhala OCR Dataset Builder | Upload, Label & Verify Text — SinhalaLearn OCR",
    description:
      "A Sinhala handwriting OCR platform to upload PDFs, extract line images, correct text, verify annotations, and export training datasets. Built for dataset creation, research, and Sinhala AI development.",
    images: [
      {
        url: "https://ocr.sinhalalearn.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sinhala OCR Dataset Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sinhala OCR Dataset Builder | Upload, Label & Verify Text — SinhalaLearn OCR",
    description:
      "A Sinhala handwriting OCR platform to upload PDFs, extract line images, correct text, verify annotations, and export training datasets. Built for dataset creation, research, and Sinhala AI development.",
    images: ["https://ocr.sinhalalearn.online/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased px-4`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <AppToast />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

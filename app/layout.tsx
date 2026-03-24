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
  title: "Rural Business Program Finder | U.S. Small Business Administration",
  description: "Find federal grants, loans, and technical assistance for rural small businesses — search by location, industry, and eligibility in seconds.",
  openGraph: {
    title: "Rural Business Program Finder | U.S. Small Business Administration",
    description: "Find federal grants, loans, and technical assistance for rural small businesses — search by location, industry, and eligibility in seconds.",
    images: [{ url: "/thumbnail.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/thumbnail.jpg"],
  },
};

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

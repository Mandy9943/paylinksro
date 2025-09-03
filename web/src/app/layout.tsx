import RefCookieBootstrap from "@/components/ref-cookie-bootstrap";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  metadataBase: new URL("https://paylinks.ro"),
  title: {
    default: "PayLinks.ro — Acceptă plăți online rapid",
    template: "%s | PayLinks.ro",
  },
  description:
    "Creează link-uri de plată și acceptă plăți online în România în 30 de secunde. Fără contracte și fără costuri de setup.",
  applicationName: "PayLinks.ro",
  keywords: [
    "PayLinks",
    "plăți online",
    "link de plată",
    "România",
    "freelanceri",
    "antreprenori",
    "donații",
    "produse digitale",
    "servicii",
  ],
  authors: [{ name: "PayLinks.ro" }],
  creator: "PayLinks.ro",
  publisher: "PayLinks.ro",
  category: "finance",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://paylinks.ro/",
    siteName: "PayLinks.ro",
    title: "PayLinks.ro — Acceptă plăți online rapid",
    description:
      "Creează link-uri de plată și acceptă plăți online în România în 30 de secunde.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PayLinks.ro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayLinks.ro — Acceptă plăți online rapid",
    description:
      "Creează link-uri de plată și acceptă plăți online în România în 30 de secunde.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RefCookieBootstrap />
        {children}

        <Toaster />
      </body>
    </html>
  );
}

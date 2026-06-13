import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "DesiSwad Foods – Pure Taste • Pure Trust",
  description: "Authentic Telangana homemade snacks delivered to your doorstep.",

  openGraph: {
    title: "DesiSwad Foods – Pure Taste • Pure Trust",
    description: "Authentic Telangana homemade snacks delivered to your doorstep.",
    url: "https://www.desiswadfoods.com",
    siteName: "DesiSwad Foods",
    images: [
      {
        url: "https://www.desiswadfoods.com/logo.png",
        width: 1200,
        height: 630,
        alt: "DesiSwad Foods",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "DesiSwad Foods – Pure Taste • Pure Trust",
    description: "Authentic Telangana homemade snacks delivered to your doorstep.",
    images: ["https://www.desiswadfoods.com/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#B22222" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '72px' }}>
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}

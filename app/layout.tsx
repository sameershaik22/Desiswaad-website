import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "DesiSwad Foods – Pure Taste • Pure Trust | Authentic Telangana Snacks",
  description: "Buy authentic homemade Telangana snacks online – Chekodi, Khara Mixture, Achappam, Janthikalu and more. Fresh, traditional, pan-India delivery. Order now!",
  keywords: "Telangana snacks, homemade namkeen, Chekodi, Khara Mixture, Achappam, buy Indian snacks online, DesiSwad",
  openGraph: {
    title: "DesiSwad Foods – Pure Taste • Pure Trust",
    description: "Authentic Telangana homemade snacks delivered to your doorstep.",
    type: "website",
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

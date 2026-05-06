import type { Metadata } from "next";
import { Bebas_Neue, Montserrat } from "next/font/google";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthBootstrap from "@/components/AuthBootstrap";
import CartRemoteHydrate from "@/components/CartRemoteHydrate";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight:["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PULSE | Ecommerce Premium",
  description: "PULSE es una tienda online moderna de tecnologia y estilo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col text-[#1C1E21] antialiased">
        <AuthBootstrap />
        <CartRemoteHydrate />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

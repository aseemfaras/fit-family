import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { CONFIG } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: CONFIG.appName,
    template: `%s | ${CONFIG.appName}`,
  },
  description: "Premium Ayurvedic products and services for a balanced life.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: CONFIG.appName,
    description: "Holistic wellness with Ayurveda.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        <CartProvider>
          <Header />
          <main className="flex-grow flex flex-col relative pt-24 md:pt-28">
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
}

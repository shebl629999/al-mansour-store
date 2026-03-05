import type { Metadata } from "next";
import "./globals.css"; 
import { CartProvider } from "../context/CartContext"; 
import Navbar from "../components/Navbar"; 
import FloatingSocials from "../components/FloatingSocials"; 

// ✅ Updated Metadata for Logo & SEO
export const metadata: Metadata = {
  title: "AL MANSOUR STORE",
  description: "أفضل الأجهزة الكهربائية والمنزلية في مصر",
  icons: {
    icon: "/logo.jpg",        // Browser Tab Icon (Favicon)
    shortcut: "/logo.jpg",    // Bookmark Icon
    apple: "/logo.jpg",       // iPhone/iPad Home Screen Icon
  },
  openGraph: {
    title: "AL MANSOUR STORE",
    description: "أفضل الأجهزة الكهربائية والمنزلية في مصر",
    url: "https://mansourf.com", // Replace with your actual domain if you have one
    siteName: "AL MANSOUR",
    images: [
      {
        url: "/logo.jpg",     // Image shown when sharing on WhatsApp/Facebook
        width: 800,
        height: 600,
        alt: "AL MANSOUR Logo",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      {/* ✅ FIX: suppressHydrationWarning prevents extension errors */}
      <body
        suppressHydrationWarning={true} 
        className="bg-gradient-to-b from-sky-50 via-white to-white min-h-screen text-black"
      >
        <CartProvider>
          <Navbar />
          {children}
          
          {/* ✅ Floating Buttons (WhatsApp, FB, TikTok) */}
          <FloatingSocials /> 
          
        </CartProvider>
      </body>
    </html>
  );
}
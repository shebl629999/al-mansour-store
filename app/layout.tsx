import type { Metadata } from "next";
import "./globals.css"; 
import { CartProvider } from "../context/CartContext"; 
import Navbar from "../components/Navbar"; 
import FloatingSocials from "../components/FloatingSocials"; 

// ✅ تم تحديث البيانات عشان تناسب الـ SEO وتظهر في جوجل بقوة
export const metadata: Metadata = {
  title: "المنصور للأجهزة الكهربائية والمنزلية | Al Mansour Store",
  description: "مؤسسة المنصور لتجارة جميع الأجهزة الكهربائية والمنزلية في مصر. تسوق الآن أفضل الشاشات، الثلاجات، الغسالات، وأجهزة العرائس بأفضل الأسعار وأعلى جودة.",
  keywords: [
    "المنصور للأجهزة",
    "معرض المنصور",
    "أجهزة كهربائية",
    "أجهزة منزلية",
    "شاشات",
    "ثلاجات",
    "غسالات",
    "بوتاجازات",
    "تجهيز عرائس",
    "أفضل أسعار الأجهزة في مصر",
    "أجهزة كهربائية بالضمان"
  ],
  icons: {
    icon: "/logo.jpg",        // Browser Tab Icon (Favicon)
    shortcut: "/logo.jpg",    // Bookmark Icon
    apple: "/logo.jpg",       // iPhone/iPad Home Screen Icon
  },
  openGraph: {
    title: "المنصور للأجهزة الكهربائية والمنزلية",
    description: "اكتشف أفضل عروض الأجهزة الكهربائية والمنزلية من معرض المنصور. جودة وضمان وأفضل الأسعار.",
    url: "https://mansourf.com", // تأكد إن ده الدومين بتاعك اللي شغال
    siteName: "المنصور للأجهزة - Al Mansour",
    images: [
      {
        url: "/logo.jpg",     // الصورة اللي هتظهر لما تشير اللينك على فيسبوك وواتساب
        width: 800,
        height: 600,
        alt: "شعار مؤسسة المنصور للأجهزة الكهربائية",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  // ✅ أوامر لمحركات البحث بأرشفة الموقع
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
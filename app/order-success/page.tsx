"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const customerName = searchParams.get("name");
  
  // تأثير قصاصات الورق (اختياري وبسيط)
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg text-center max-w-lg w-full border border-green-100 relative overflow-hidden">
        
        {/* دائرة علامة الصح المتحركة */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-800 mb-2">
          شكراً لك {customerName ? `يا ${customerName}` : ""}!
        </h1>
        <p className="text-lg text-gray-600 font-bold mb-6">
          تم استلام طلبك بنجاح 🎉
        </p>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8">
          <p className="text-sm text-gray-500 mb-1">رقم الطلب الخاص بك</p>
          <p className="text-2xl font-mono font-black text-sky-600 tracking-wider">#{orderId || "12345"}</p>
        </div>

        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          سقوم أحد ممثلي خدمة العملاء بمراجعة طلبك على واتساب والتواصل معك لتأكيد موعد الشحن قريباً جداً.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-sky-200"
          >
            العودة للتسوق
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
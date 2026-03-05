"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// قائمة المحافظات
const GOVERNORATES = [
  "القاهرة", "الجيزة", "القليوبية", "الإسكندرية", "البحيرة", "مطروح", "دمياط", 
  "الدقهلية", "كفر الشيخ", "الغربية", "المنوفية", "الشرقية", "بورسعيد", "الإسماعيلية", 
  "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم", "المنيا", "أسيوط", 
  "الوادي الجديد", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر"
];

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart() as any;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- States for Form Fields ---
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [notes, setNotes] = useState("");

  // تحويل المستخدم للصفحة الرئيسية إذا كانت السلة فارغة
  useEffect(() => {
    if (cart.length === 0) {
      // router.push("/"); // يمكنك تفعيل هذا السطر لإعادة التوجيه تلقائياً
    }
  }, [cart, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return alert("السلة فارغة!");
    
    // التحقق من الحقول الأساسية
    if (!name || !phone || !governorate || !city || !street || !building) {
      return alert("الرجاء استكمال البيانات الأساسية (الاسم، الهاتف، العنوان)");
    }

    setIsSubmitting(true);

    try {
      // تنسيق العنوان ليظهر بشكل مقروء للأدمن
      const formattedAddress = `
        ${governorate} - ${city}
        شارع: ${street} - مبنى: ${building}
        ${floor ? `- دور: ${floor}` : ""} ${apartment ? `- شقة: ${apartment}` : ""}
        ${notes ? `(ملاحظات: ${notes})` : ""}
      `.trim();

      // إرسال الطلب لـ Firebase
      await addDoc(collection(db, "orders"), {
        client: {
          name,
          phone,
          address: formattedAddress, // العنوان النصي الكامل
          addressDetails: { // تخزين التفاصيل بشكل هيكلي أيضاً (اختياري)
            governorate,
            city,
            street,
            building,
            floor,
            apartment,
            notes
          }
        },
        items: cart,
        total: total,
        status: "pending",
        createdAt: new Date(),
        paymentMethod: "Cash on Delivery"
      });

      // نجاح العملية
      clearCart();
      alert("✅ تم استلام طلبك بنجاح! سيتم التواصل معك قريباً.");
      router.push("/"); // العودة للصفحة الرئيسية

    } catch (error) {
      console.error("Checkout Error:", error);
      alert("❌ حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h2 className="text-3xl font-bold text-gray-300 mb-4">السلة فارغة 🛒</h2>
        <Link href="/" className="bg-sky-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-sky-600 transition">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8 text-center md:text-right border-b pb-4">
          إتمام الطلب 📦
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= القسم الأيمن: نموذج البيانات ================= */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm">1</span>
                بيانات الدفع والتوصيل
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. المعلومات الشخصية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">الاسم بالكامل</label>
                    <input 
                      type="text" required 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                      placeholder="مثال: أحمد محمد"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">رقم الهاتف</label>
                    <input 
                      type="tel" required 
                      pattern="^01[0-9]{9}$"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                      placeholder="01xxxxxxxxx"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 2. العنوان بالتفصيل */}
                <div>
                   <h3 className="text-sm font-bold text-gray-500 mb-3">عنوان التوصيل:</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* المحافظة */}
                      <div>
                        <label className="text-xs text-gray-400">المحافظة</label>
                        <select 
                          required 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
                          value={governorate} onChange={(e) => setGovernorate(e.target.value)}
                        >
                          <option value="">اختار المحافظة</option>
                          {GOVERNORATES.map((gov) => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>

                      {/* المدينة */}
                      <div>
                        <label className="text-xs text-gray-400">المدينة / الحي</label>
                        <input 
                          type="text" required 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                          placeholder="مثال: مدينة نصر"
                          value={city} onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                   </div>

                   {/* الشارع */}
                   <div className="mb-4">
                      <label className="text-xs text-gray-400">اسم الشارع</label>
                      <input 
                        type="text" required 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                        placeholder="مثال: شارع الطيران"
                        value={street} onChange={(e) => setStreet(e.target.value)}
                      />
                   </div>

                   {/* تفاصيل المبنى (3 أعمدة) */}
                   <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-gray-400">رقم العقار</label>
                        <input 
                          type="text" required 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-center"
                          placeholder="مثال: 15"
                          value={building} onChange={(e) => setBuilding(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">الدور</label>
                        <input 
                          type="text" 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-center"
                          placeholder="مثال: 3"
                          value={floor} onChange={(e) => setFloor(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">رقم الشقة</label>
                        <input 
                          type="text" 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-center"
                          placeholder="مثال: 5"
                          value={apartment} onChange={(e) => setApartment(e.target.value)}
                        />
                      </div>
                   </div>

                   {/* ملاحظات */}
                   <div>
                      <label className="text-xs text-gray-400">علامة مميزة / ملاحظات (اختياري)</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                        placeholder="مثال: بجوار صيدلية العزبي"
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                      />
                   </div>
                </div>

                {/* زر التأكيد للموبايل (يختفي في الشاشات الكبيرة ويظهر في الأسفل) */}
                <button 
                  type="submit" disabled={isSubmitting}
                  className="lg:hidden w-full bg-sky-600 text-white font-bold py-4 rounded-xl hover:bg-sky-700 transition shadow-lg active:scale-95 disabled:opacity-70 mt-4"
                >
                  {isSubmitting ? "جاري التأكيد..." : `تأكيد الطلب (${total.toLocaleString()} ج.م)`}
                </button>

              </form>
            </div>
          </div>

          {/* ================= القسم الأيسر: ملخص الطلب ================= */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm">2</span>
                ملخص الطلب
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center border-b border-gray-50 pb-3 last:border-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-1 border">
                        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700 line-clamp-2">{item.name}</p>
                      {item.model && <p className="text-xs text-gray-400 font-mono">{item.model}</p>}
                      <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">الكمية: {item.quantity}</span>
                          <span className="text-sm font-bold text-sky-600">{item.price.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>المجموع الفرعي</span>
                  <span>{total.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>الشحن</span>
                  <span className="text-green-600 font-bold">مجاني</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                  <span>الإجمالي</span>
                  <span>{total.toLocaleString()} ج.م</span>
                </div>
              </div>
              
              <div className="bg-sky-50 text-sky-700 p-3 rounded-lg mt-4 text-xs font-bold text-center">
                💵 الدفع عند الاستلام
              </div>

              {/* زر التأكيد (ديسكتوب) */}
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="hidden lg:block w-full bg-sky-600 text-white font-bold py-4 rounded-xl hover:bg-sky-700 transition shadow-lg active:scale-95 disabled:opacity-70 mt-6"
              >
                {isSubmitting ? "جاري التنفيذ..." : "تأكيد الطلب الآن ✅"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
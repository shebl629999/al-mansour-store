"use client";

import { useState, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { collection, doc, runTransaction } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Governorates List
const GOVERNORATES = [
  "القاهرة", "الجيزة", "القليوبية", "الإسكندرية", "البحيرة", "مطروح", "دمياط", 
  "الدقهلية", "كفر الشيخ", "الغربية", "المنوفية", "الشرقية", "بورسعيد", "الإسماعيلية", 
  "السويس", "شمال سيناء", "جنوب سيناء", "بني سويف", "الفيوم", "المنيا", "أسيوط", 
  "الوادي الجديد", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر"
];

export default function CartPage() {
  const { cart, removeFromCart, addToCart, decreaseQuantity, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Helper: Clean Price Input ---
  const getPrice = (price: any): number => {
    if (price === undefined || price === null) return 0;
    if (typeof price === 'number') return price;
    
    // Remove commas and non-numeric chars except dot
    const cleanString = price.toString().replace(/,/g, '').replace(/[^\d.]/g, '');
    const number = parseFloat(cleanString);
    
    return isNaN(number) ? 0 : number;
  };

  // --- Calculate Total ---
  const calculatedTotal = useMemo(() => {
    return cart.reduce((acc, item: any) => { // Added 'any' bypass
      const price = getPrice(item.price);
      const qty = Number(item.quantity) || 1;
      return acc + (price * qty);
    }, 0);
  }, [cart]);

  // --- Form State ---
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [notes, setNotes] = useState("");

  // --- Checkout Handler (Transaction Fixed) ---
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return alert("السلة فارغة!");
    
    if (!name || !phone || !governorate || !city || !street || !building) {
      return alert("الرجاء استكمال البيانات الأساسية (الاسم، الهاتف، والعنوان)");
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `
        ${governorate} - ${city}
        شارع: ${street} - عقار: ${building}
        ${floor ? `- دور: ${floor}` : ""} ${apartment ? `- شقة: ${apartment}` : ""}
        ${notes ? `(ملاحظات: ${notes})` : ""}
      `.trim();

      const orderData = {
        client: {
          name,
          phone,
          address: fullAddress,
          addressDetails: {
            governorate, city, street, building, floor, apartment, notes
          }
        },
        items: cart,
        total: calculatedTotal,
        status: "pending",
        createdAt: new Date(),
        paymentMethod: "Cash on Delivery"
      };

      // ✅ START TRANSACTION
      const orderId = await runTransaction(db, async (transaction) => {
        
        // --- PHASE 1: READ ALL DATA FIRST ---
        const productsUpdates = [];

        for (const item of cart as any[]) { // Added 'any[]' bypass
            const productRef = doc(db, "products", item.id);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists()) {
                throw new Error(`المنتج "${item.name}" لم يعد موجوداً!`);
            }

            const data = productDoc.data() as any; // Added 'any' bypass
            
            // Logic: Check 'stock' first, then 'quantity'. If both missing, assume 50.
            let dbStock = data.stock ?? data.quantity;
            let currentStock = (dbStock === undefined || dbStock === null || dbStock === "") 
                               ? 50 // Default safe stock if field is missing
                               : Number(dbStock);

            if (isNaN(currentStock)) currentStock = 50; // Safety net for bad data

            const requestedQty = item.quantity || 1;

            if (currentStock < requestedQty) {
                throw new Error(`عذراً، الكمية المطلوبة من "${item.name}" غير متوفرة. المتاح حالياً: ${currentStock}`);
            }

            // Store the update for Phase 2 (Do not update yet)
            productsUpdates.push({
                ref: productRef,
                newStock: currentStock - requestedQty
            });
        }

        // --- PHASE 2: WRITE ALL DATA ---
        
        // 1. Update Stocks
        productsUpdates.forEach((update) => {
            transaction.update(update.ref, { stock: update.newStock });
        });

        // 2. Create Order
        const newOrderRef = doc(collection(db, "orders"));
        transaction.set(newOrderRef, orderData);

        return newOrderRef.id; // Return Order ID to use outside
      });

      // ✅ SUCCESS
      clearCart();
      router.push(`/order-success?id=${orderId}&name=${encodeURIComponent(name)}`);

    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert(`❌ حدث خطأ: ${error.message || "فشل إرسال الطلب"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Empty Cart View ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">السلة فارغة</h2>
        <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات بعد.</p>
        <Link href="/" className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-700 transition shadow-lg">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  // --- Main Cart View ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8 text-center md:text-right border-b pb-4">
          سلة المشتريات وإتمام الطلب
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================= RIGHT: Form ======================= */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm">1</span>
                بيانات الشحن والتوصيل
              </h2>

              <form onSubmit={handleCheckout} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">الاسم بالكامل</label>
                    <input 
                      type="text" required 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                      placeholder="الاسم ثلاثي"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">رقم الهاتف</label>
                    <input 
                      type="tel" required pattern="^01[0-9]{9}$"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                      placeholder="01xxxxxxxxx"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <hr className="border-gray-100 my-4" />

                <div>
                  <h3 className="text-sm font-bold text-gray-500 mb-3">العنوان بالتفصيل:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400">المحافظة</label>
                      <select 
                        required 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none"
                        value={governorate} onChange={(e) => setGovernorate(e.target.value)}
                      >
                        <option value="">اختر المحافظة</option>
                        {GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>

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

                  <div className="mb-4">
                    <label className="text-xs text-gray-400">اسم الشارع</label>
                    <input 
                      type="text" required 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="مثال: شارع الطيران"
                      value={street} onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>

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
                        placeholder="مثال: 6"
                        value={apartment} onChange={(e) => setApartment(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400">علامة مميزة (اختياري)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="مثال: بجوار صيدلية..."
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile Button */}
                <button 
                  type="submit" disabled={isSubmitting}
                  className="lg:hidden w-full bg-sky-600 text-white font-bold py-4 rounded-xl hover:bg-sky-700 transition shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "جاري التأكيد..." : `تأكيد الطلب (${calculatedTotal.toLocaleString()} ج.م)`}
                </button>

              </form>
            </div>
          </div>

          {/* ======================= LEFT: Products Summary ======================= */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm">2</span>
                مراجعة المنتجات
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {/* ✅ Added 'item: any' below so TypeScript ignores all missing product properties completely */}
                {cart.map((item: any, index: number) => {
                  
                  const itemStock = item.stock !== undefined ? Number(item.stock) : 50;
                  const isMaxedOut = (item.quantity ?? 1) >= itemStock;

                  return (
                    <div 
                      key={`${item.id}-${index}`} 
                      className="flex gap-4 border border-gray-50 p-3 rounded-xl hover:border-sky-100 transition relative group"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-lg p-1 border flex-shrink-0 flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-700 text-sm line-clamp-2 leading-relaxed">{item.name}</h4>
                          {/* ✅ Fixed class name to actually look like text, not "..." */}
                          {(item as any).model && <p className="text-gray-500 text-sm">{(item as any).model}</p>}
                        </div>
                        
                        <div className="flex justify-between items-end mt-2">
                          {/* Qty Controls */}
                          <div className="flex items-center bg-gray-100 rounded-lg h-7">
                            <button 
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              className="w-7 h-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 rounded-r-lg transition"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-gray-700">{item.quantity || 1}</span>
                            
                            <button 
                              type="button"
                              onClick={() => {
                                if (!isMaxedOut) addToCart(item);
                              }}
                              disabled={isMaxedOut}
                              className={`w-7 h-full flex items-center justify-center rounded-l-lg transition ${
                                isMaxedOut 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                : "hover:bg-green-100 hover:text-green-600"
                              }`}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-left">
                             <div className="text-sky-600 font-bold text-sm">
                               {(getPrice(item.price) * (item.quantity || 1)).toLocaleString()} ج.م
                             </div>
                             {isMaxedOut && (
                                <span className="text-[10px] text-red-500 font-bold block">حد أقصى</span>
                             )}
                             <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 text-[10px] underline hover:text-red-600 mt-1 block"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>المجموع الفرعي</span>
                  <span>{calculatedTotal.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>الشحن</span>
                  <span className="text-green-600 font-bold">مجاني</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t mt-2">
                  <span>الإجمالي الكلي</span>
                  <span>{calculatedTotal.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="bg-sky-50 text-sky-700 p-3 rounded-lg mt-4 text-xs font-bold text-center flex items-center justify-center gap-2">
                <span>💵</span> الدفع عند الاستلام
              </div>

              {/* Desktop Button */}
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="hidden lg:block w-full bg-sky-600 text-white font-bold py-4 rounded-xl hover:bg-sky-700 transition shadow-lg mt-6 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "جاري التحقق من المخزون..." : "تأكيد الطلب الآن ✅"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
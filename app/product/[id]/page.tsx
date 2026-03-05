"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; 
import { useCart } from "../../../context/CartContext"; 

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart(); 
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false); 

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // ✅ تعيين المخزون افتراضياً بـ 5 إذا لم يكن موجوداً
          setProduct({ 
            id: docSnap.id, 
            ...data,
            stock: data.stock !== undefined ? Number(data.stock) : 5 
          });
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // ✅ منع الإضافة إذا كان المخزون 0
    if (product && product.stock > 0) {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    } else {
        alert("عذراً، هذا المنتج نفد من المخزون!");
    }
  };

  if (loading) return <div className="min-h-screen bg-sky-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;

  if (!product) return <div>المنتج غير موجود</div>;

  return (
    <div className="min-h-screen pb-10 bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-500 hover:text-sky-600 transition-colors font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
          العودة للمتجر
        </button>

        <div className="bg-white rounded-3xl shadow-lg border border-sky-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            
            {/* قسم الصورة */}
            <div className="bg-white p-8 flex items-center justify-center border-l-0 md:border-l border-sky-50 relative">
              
              <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                {product.isBestSeller && (
                  <span className="bg-amber-400 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm w-fit animate-pulse">الأكثر مبيعاً 🔥</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm w-fit">خصم {product.discount}%</span>
                )}
              </div>

              <img src={product.image || "https://via.placeholder.com/500"} alt={product.name} className="max-h-[500px] w-auto object-contain hover:scale-105 transition duration-500" />
            </div>

            {/* قسم التفاصيل */}
            <div className="p-8 flex flex-col justify-center">
              <span className="text-sky-500 font-bold tracking-wide text-sm mb-2 uppercase bg-sky-50 w-fit px-3 py-1 rounded-lg">
                {product.brand} | {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 leading-tight">{product.name}</h1>
              {product.model && <p className="text-gray-400 text-sm font-mono mb-4">Model: {product.model}</p>}

              {/* ✅ عرض حالة المخزون */}
              <div className="mb-6">
                {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        متوفر: {product.stock} قطعة في المخزون
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        نفد من المخزون (Out of Stock)
                    </span>
                )}
              </div>

              {/* السعر */}
              <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-fit min-w-[200px]">
                <p className="text-gray-400 text-xs font-bold mb-1">السعر النهائي:</p>
                <div className="flex items-end gap-3">
                  <span className={`text-4xl font-black ${product.oldPrice || product.originalPrice ? "text-red-600" : "text-sky-600"}`}>
                    {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xl text-gray-600 font-bold mb-1">ج.م</span>
                  
                  {(product.oldPrice || product.originalPrice) && (
                    <span className="text-lg text-gray-400 line-through decoration-red-400 mb-2 mr-2">
                      {Number(product.oldPrice || product.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* ✅ زر الإضافة للعربة (تحديث الحالة) */}
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0} // تعطيل الزر إذا المخزون 0
                  className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    product.stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" // تنسيق الزر المعطل
                    : isAdded 
                        ? "bg-green-500 text-white shadow-green-200" 
                        : "bg-sky-500 text-white hover:bg-sky-600 shadow-sky-200"
                  }`}
                >
                  {product.stock === 0 ? (
                      <>🚫 غير متوفر حالياً</>
                  ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        {isAdded ? "تمت الإضافة ✓" : "إضافة للسلة"}
                      </>
                  )}
                </button>
                <button className="px-6 py-4 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">♥</button>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-800 mb-3 text-lg">تفاصيل ومواصفات المنتج:</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                  {product.description || "لا يوجد وصف متاح لهذا المنتج."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
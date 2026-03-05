"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL } from "../../lib/config"; // 👈 استيراد الإيميل

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); 

  const router = useRouter();

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // تنظيف الإدخال (حذف المسافات وتحويل لحروف صغيرة)
    const cleanEmail = email.trim().toLowerCase();
    const cleanAdminEmail = ADMIN_EMAIL.trim().toLowerCase();

    try {
      if (isLogin) {
        // 🔐 تسجيل الدخول
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        
        // مقارنة دقيقة
        if (cleanEmail === cleanAdminEmail) {
          console.log("✅ Welcome Admin! Redirecting to /admin...");
          router.push("/admin"); 
        } else {
          console.log("👤 User detected. Redirecting to /...");
          router.push("/"); 
        }

      } else {
        // 🆕 إنشاء حساب جديد
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        router.push("/"); 
      }
      
    } catch (err: any) {
      console.error("Firebase Error:", err.code);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة ❌");
      } else if (err.code === "auth/email-already-in-use") {
        setError("هذا البريد مسجل بالفعل 📧");
      } else {
        setError("حدث خطأ غير متوقع ⚠️");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-sky-100 w-full max-w-md">
        <h1 className="text-3xl font-black text-sky-600 mb-2 text-center">
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
        </h1>
        
        <form onSubmit={handleAuth} className="space-y-4 mt-8">
          <input 
            type="email" required 
            className="w-full p-3 border border-sky-200 rounded-lg text-black"
            placeholder="البريد الإلكتروني"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" required minLength={6}
            className="w-full p-3 border border-sky-200 rounded-lg text-black"
            placeholder="كلمة المرور"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-sky-500 text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition">
            {loading ? "جاري التحميل..." : (isLogin ? "دخول" : "إنشاء الحساب")}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t pt-4">
           <button onClick={() => setIsLogin(!isLogin)} className="text-sky-600 font-bold hover:underline">
             {isLogin ? "إنشاء حساب جديد" : "لدي حساب بالفعل"}
           </button>
        </div>
      </div>
    </div>
  );
}
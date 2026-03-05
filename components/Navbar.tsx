"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase"; 
import { onAuthStateChanged, signOut, User } from "firebase/auth"; 
import SearchBar from "./SearchBar"; // ✅ 1. استيراد شريط البحث الذكي

export default function Navbar() {
  const { cart } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload(); 
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-sky-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4"> 
          
          {/* 1. الشعار */}
          <Link href="/" className="flex-shrink-0 cursor-pointer group">
            <div className="flex flex-col items-start justify-center">
              <h1 className="text-2xl font-black text-sky-500 tracking-tighter uppercase leading-none group-hover:text-sky-600 transition-colors">
                AL MANSOUR
              </h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] group-hover:text-sky-400 transition-colors">
                (Home Appliances)
              </span>
            </div>
          </Link>

          {/* 2. شريط البحث الذكي (يظهر فقط في الشاشات المتوسطة والكبيرة) */}
          <div className="hidden md:block flex-1 mx-8">
            <SearchBar />
          </div>

          {/* 3. الأزرار (Login / Logout / Cart) */}
          <div className="flex items-center gap-6">
              
              {/* زر الدخول / الخروج */}
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end">
                      <span className="text-[10px] text-gray-400 font-bold">مرحباً بك</span>
                      <span className="text-xs font-bold text-sky-600 max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors text-sm flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <Link href="/login">
                  <button className="text-gray-600 hover:text-sky-500 font-bold transition-colors hidden sm:flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span>دخول</span>
                  </button>
                </Link>
              )}
              
              {/* زر السلة */}
              <Link href="/cart" className="relative group p-1">
                {/* الأيقونة */}
                <div className="text-gray-700 group-hover:text-sky-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                </div>

                {/* الدائرة الحمراء (Badge) */}
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-md transform group-hover:scale-110 transition-transform">
                    {String(cart.length)}
                  </span>
                )}
              </Link>

          </div>

        </div>
        
        {/* ✅ (اختياري) إضافة البحث للموبايل أسفل الهيدر إذا أردت */}
        <div className="md:hidden pb-3">
            <SearchBar />
        </div>
      </div>
    </nav>
  );
}
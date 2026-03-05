"use client";

import Link from "next/link";

export default function SocialSidebar() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-sky-100 h-fit">
      <h3 className="font-bold text-sky-600 mb-3 border-b border-sky-100 pb-2">تواصل معنا</h3>
      
      <div className="flex flex-col gap-3">
        
        {/* WhatsApp */}
        <Link 
          href="https://wa.me/message/NB6MZPYRQISQB1" 
          target="_blank"
          className="flex items-center gap-3 p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105 transition-all"
        >
          <span className="bg-green-500 text-white p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326z"/></svg>
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold">واتساب</span>
            <span className="text-[10px] text-gray-500 opacity-80" dir="ltr">wa.me/...</span>
          </div>
        </Link>

        {/* Facebook */}
        <Link 
          href="https://www.facebook.com/share/14VPUXzB6fq/" 
          target="_blank"
          className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 transition-all"
        >
          <span className="bg-blue-600 text-white p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold">فيسبوك</span>
            <span className="text-[10px] text-gray-500 opacity-80" dir="ltr">facebook.com</span>
          </div>
        </Link>

        {/* TikTok */}
        <Link 
          href="https://www.tiktok.com/@elmansor82?_r=1&_t=ZS-93wi8ZXFxWa" 
          target="_blank"
          className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 hover:scale-105 transition-all"
        >
          <span className="bg-black text-white p-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/></svg>
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold">تيك توك</span>
            <span className="text-[10px] text-gray-500 opacity-80" dir="ltr">tiktok.com</span>
          </div>
        </Link>

      </div>
    </div>
  );
}
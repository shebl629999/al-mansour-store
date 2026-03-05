"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ 1. تعريف نوع البيانات للبحث الذكي
type SearchItem = {
  id: string;
  display: string;   // ما يظهر للمستخدم في القائمة
  term: string;      // الكلمة التي نرسلها للبحث في الرابط
  keywords: string[]; // المرادفات (عربي، إنجليزي، عامية)
};

// ✅ 2. قاعدة بيانات البحث الذكي (قاموس المرادفات)
const SEARCH_DB: SearchItem[] = [
  // --- الأقسام Categories ---
  { 
    id: "fridges", 
    display: "ثلاجات (Refrigerators)", 
    term: "ثلاجات", 
    keywords: ["تلاجة", "تلاجات", "ثلاجه", "fridge", "refrigerator", "freezer", "تبريد"] 
  },
  { 
    id: "washing_machines", 
    display: "غسالات (Washing Machines)", 
    term: "غسالات", 
    keywords: ["غساله", "غسالة", "washer", "washing", "laundry", "هدوم"] 
  },
  { 
    id: "screens", 
    display: "شاشات (TVs)", 
    term: "شاشات", 
    keywords: ["تلفزيون", "تلفزيونات", "tv", "screen", "smart", "4k", "led"] 
  },
  { 
    id: "cookers", 
    display: "بوتاجازات (Cookers)", 
    term: "بوتاجازات", 
    keywords: ["بوتاجاز", "بوتجاز", "cooker", "oven", "gas", "stove", "طبخ"] 
  },
  { 
    id: "ac", 
    display: "تكييفات (Air Conditioners)", 
    term: "تكييفات", 
    keywords: ["تكييف", "مكيف", "ac", "air condition", "split", "cool"] 
  },
  { 
    id: "heaters", 
    display: "سخانات (Heaters)", 
    term: "سخانات", 
    keywords: ["سخان", "heater", "gas heater", "electric heater", "ماء ساخن"] 
  },
  
  // --- الماركات Brands ---
  { id: "lg", display: "ال جي (LG)", term: "LG", keywords: ["lg", "ال جي", "ال جى"] },
  { id: "samsung", display: "سامسونج (Samsung)", term: "Samsung", keywords: ["samsung", "سامسونج", "سمسونج"] },
  { id: "tornado", display: "تورنيدو (Tornado)", term: "Tornado", keywords: ["tornado", "تورنيدو", "تورنيدوا"] },
  { id: "toshiba", display: "توشيبا (Toshiba)", term: "Toshiba", keywords: ["toshiba", "توشيبا", "توشيبى"] },
  { id: "sharp", display: "شارب (Sharp)", term: "Sharp", keywords: ["sharp", "شارب"] },
  { id: "fresh", display: "فريش (Fresh)", term: "Fresh", keywords: ["fresh", "فريش"] },
  { id: "beko", display: "بيكو (Beko)", term: "Beko", keywords: ["beko", "بيكو"] },
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ✅ 3. منطق التصفية الذكي
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      const lowerValue = value.toLowerCase();

      const filtered = SEARCH_DB.filter((item) => {
        // البحث في الاسم المعروض
        const matchDisplay = item.display.toLowerCase().includes(lowerValue);
        // البحث في الكلمات المفتاحية (السر هنا!)
        const matchKeyword = item.keywords.some(keyword => keyword.toLowerCase().includes(lowerValue));
        
        return matchDisplay || matchKeyword;
      });

      setSuggestions(filtered.slice(0, 6)); 
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // ✅ 4. عند اختيار عنصر، نرسل "الاسم الرسمي" وليس ما كتبه المستخدم
  const handleSelect = (item: SearchItem) => {
    setQuery(item.display); // نعرض الاسم الجميل في الشريط
    setShowSuggestions(false);
    router.push(`/?search=${encodeURIComponent(item.term)}`); // نبحث بالاسم الصحيح
  };

  const handleManualSearch = () => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  // إخفاء القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
          placeholder="ابحث عن منتج (مثال: تلاجات، fridge)..."
          className="w-full py-2.5 pr-10 pl-4 rounded-full border border-gray-200 bg-sky-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-700 text-right shadow-sm placeholder-gray-400"
        />
        <button 
          onClick={handleManualSearch}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-700 p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-right">
          <ul>
            {suggestions.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-sky-50 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-50 last:border-none"
              >
                <div className="flex flex-col">
                    <span className="text-gray-700 font-medium group-hover:text-sky-600">{item.display}</span>
                    {/* اختيارياً: عرض الكلمة التي تطابقت مع بحث المستخدم لتوضيح السبب */}
                    {/* <span className="text-xs text-gray-400">قسم: {item.term}</span> */}
                </div>
                <span className="text-gray-300 -rotate-45 group-hover:text-sky-400 text-sm">⬉</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
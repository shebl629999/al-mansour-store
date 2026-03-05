"use client";

import SocialSidebar from "./SocialSidebar"; // ✅ Import the Social Component

interface FilterProps {
  brands: string[];
  categories: string[];
  selectedBrand: string;
  selectedCategory: string;
  onSelectBrand: (brand: string) => void;
  onSelectCategory: (category: string) => void;
}

// ✅ Added default values: brands = [], categories = []
export default function FilterSidebar({ 
  brands = [], 
  categories = [], 
  selectedBrand, 
  selectedCategory, 
  onSelectBrand, 
  onSelectCategory 
}: FilterProps) {
  return (
    // ✅ Main Container: Sticky so it follows the user
    <div className="bg-white p-5 rounded-xl shadow-sm border border-sky-100 h-fit sticky top-24 flex flex-col gap-6">
      
      {/* --- Filter 1: Brands (الماركة) --- */}
      <div>
        <h3 className="font-bold text-sky-600 mb-3 border-b border-sky-100 pb-2">
          الماركة
        </h3>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent pr-1">
          <button 
            onClick={() => onSelectBrand("")}
            className={`text-right px-3 py-2 rounded-lg text-sm transition-all ${selectedBrand === "" ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-200" : "text-gray-600 hover:bg-sky-50"}`}
          >
            الكل
          </button>
          
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className={`text-right px-3 py-2 rounded-lg text-sm transition-all ${selectedBrand === brand ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-200" : "text-gray-600 hover:bg-sky-50"}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* --- Filter 2: Categories (القسم) --- */}
      <div>
        <h3 className="font-bold text-sky-600 mb-3 border-b border-sky-100 pb-2">
          القسم
        </h3>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent pr-1">
          <button 
            onClick={() => onSelectCategory("")}
            className={`text-right px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === "" ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-200" : "text-gray-600 hover:bg-sky-50"}`}
          >
            جميع الأقسام
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`text-right px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === cat ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-200" : "text-gray-600 hover:bg-sky-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- Divider --- */}
      <hr className="border-gray-100" />

      {/* --- Social Media Section --- */}
      {/* This renders the component we made earlier inside the sidebar */}
      <SocialSidebar />

    </div>
  );
}
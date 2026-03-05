"use client";

import { useState, useEffect, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; 

// ✅ 1. Import your components
import FilterSidebar from "../components/FilterSidebar";
// import SocialSidebar from "../components/SocialSidebar"; // ❌ REMOVED: It is now inside FilterSidebar
import HeroVideo from "../components/HeroVideo"; 

const ITEMS_PER_PAGE = 18;

// Helper to normalize Arabic text
const normalizeText = (text: string) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ة/g, "ه");
};

// ================= BRANDS DATA =================
const BRANDS = [
  { name: "Beko", logo: "https://glotech.co.uk/media/mage360_brands/brands/image/b/e/beko_5.png", value: "Beko" },
  { name: "Fresh", logo: "https://images.alborsaanews.com/2025/08/1552463410_757_199060_img_778-scaled.jpg", value: "Fresh" },
  { name: "Haier", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0h-VCtz6wZ8Bmyw0MHWsnL8kiSa7zjtJC6w&s", value: "Haier" },
  { name: "Unionaire", logo: "https://cairocart.com/pub/media/codazon_cache/brand/1200x/Manufacturer/cccccc.png", value: "Unionaire" },
  { name: "Kiriazi", logo: "https://m.media-amazon.com/images/S/aplus-media/sota/fe698afc-79d7-43fe-94f9-6c101a9f9fc3.__CR0,0,600,180_PT0_SX600_V1___.jpg", value: "Kiriazi" },
  { name: "Toshiba", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwarNuJLw4f3DFQIXEA5hLqHX_Oe-s_f1dNA&s", value: "Toshiba" },
  { name: "Sharp", logo: "https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/logo-sharp-transparent-PNG.png", value: "Sharp" },
  { name: "Tornado", logo: "https://gaballah.com/cdn/shop/collections/80277A88-11D7-42F9-864D-F0811818801F.jpg?v=1728560858&width=2048", value: "Tornado" },
  { name: "Hoover", logo: "https://cdn.salla.sa/wWRQaK/MFgUAK10Lvgw7ZckH60kPQmAS9uf2H4xH8HNN8iX.png", value: "Hoover" },
  { name: "Hitachi", logo: "https://cdn.salla.sa/GDdQy/OwCBuXXcaZq6egRsqF5xmBCbR84RhmYCZExcdZxK.jpg", value: "Hitachi" },
  { name: "Sony", logo: "https://pluspng.com/logo-img/so142sond681-sony-logo-sony-group-portal-home.png", value: "Sony" },
  { name: "Cagito", logo: "https://placehold.co/100x50?text=Cagito", value: "Cagito" },
  { name: "La Germania", logo: "https://cdn.salla.sa/aeKxKG/4B43ZzXnM5Jq66ORhNtuenbyhMczcNgH6xsF6Z0L.png", value: "La Germania" },
];

// ================= CATEGORIES DATA =================
const CATEGORIES = [
  { name: "شاشات", image: "https://screens.maintenance-product.com/wp-content/uploads/2022/03/screens-maintenance.jpg", value: "شاشات" },
  { name: "ثلاجات", image: "https://advice.aqarmap.com.eg/ar/wp-content/uploads/2024/09/4yddp4k0r41-w960.jpg", value: "ثلاجات" },
  { name: "ديب فريزر", image: "https://i.ytimg.com/vi/z2HI77QWzTI/maxresdefault.jpg", value: "ديب فريزر" },
  { name: "غسالات ملابس", image: "https://static.labeb.com/test/images/articles/322/rfz0bytbhy3-w960.jpg", value: "غسالات ملابس" },
  { name: "غسالات أطباق", image: "https://png.pngtree.com/png-vector/20251016/ourmid/pngtree-three-dishwashers-in-different-states-silver-modern-design-png-image_17648694.webp", value: "غسالات أطباق" },
  { name: "سخانات", image: "https://cdn.elwatannews.com/watan/840x473/21252259591633968092.jpg", value: "سخانات" },
  { name: "بوتاجازات", image: "https://shababel3alam.com/wp-content/uploads/2023/03/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%A8%D9%88%D8%AA%D8%A7%D8%AC%D8%A7%D8%B2%D8%A7%D8%AA-%D9%81%D9%8A-%D9%85%D8%B5%D8%B1.jpg", value: "بوتاجازات" },
  { name: "أفران", image: "https://www.lg.com/ae_ar/lg-story/helpful-guide/your-guide-to-the-best-built-in-cookers/%D8%A3%D9%81%D8%B1%D8%A7%D9%86%20%D8%A5%D9%84%20%D8%AC%D9%8A%20%D8%A7%D9%84%D9%85%D8%AF%D9%85%D8%AC%D8%A9.jpg", value: "أفران" },
  { name: "تكييفات", image: "https://cdn.al-ain.com/archive/news-image/shrkt-tkyyf-fy-msr_277016.jpg", value: "تكييفات" },
  { name: "مكانس", image: "https://static.labeb.com/test/images/articles/332/tpnjruqypp2-w1920.jpg", value: "مكانس" },
  { name: "خلاطات", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXeran8cNwAebYVkD15OkOl_YEh9OtsuK71g&s", value: "خلاطات" },
  { name: "مراوح", image: "https://media.gemini.media/img/large/2022/4/2/2022_4_2_22_24_52_713.jpg", value: "مراوح" },
  { name: "ميكروويف", image: "https://png.pngtree.com/png-vector/20250801/ourlarge/pngtree-futuristic-electric-microwave-oven-with-digital-display-png-image_16803488.webp", value: "ميكروويف" },
  { name: "شفاطات", image: "https://m.media-amazon.com/images/I/61uWtLyD2kL.jpg", value: "شفاطات" },
];

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  model: string;
  isBestSeller?: boolean;
  oldPrice?: number;
  discount?: number;
};

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const searchParams = useSearchParams();
  const rawSearchQuery = searchParams.get("search"); 
  const searchQuery = normalizeText(rawSearchQuery || ""); 

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBestSellersOnly, setShowBestSellersOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get simple lists of names for the Sidebar
  const brandNames = BRANDS.map(b => b.value);
  const categoryNames = CATEGORIES.map(c => c.value);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        
        const counts: Record<string, number> = {};

        const productsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const brandName = (data.brand || data["Brand"] || "Unknown").toString().trim();
          const categoryName = (data.category || data["Category"] || "Unknown").toString().trim();
          const groupKey = `${brandName.toLowerCase()}_${categoryName.toLowerCase()}`;
          
          const originalDbPrice = Number(data.originalPrice || data.price || data["Price"]);
          const realDiscount = Number(data.discount || 0);
          const finalPrice = Math.round(originalDbPrice * (1 - (realDiscount / 100)));

          const modelNumber = (data.model || data["Model Name"] || "").toString();
          const displayName = data.description || data["Description"] || data.name || data["Model Name"];

          if (!counts[groupKey]) counts[groupKey] = 0;

          let isBestSeller = false;
          if (counts[groupKey] < 2) {
            isBestSeller = true;
            counts[groupKey]++;
          }

          return {
            id: doc.id,
            name: displayName, 
            model: modelNumber, 
            price: finalPrice, 
            image: data.image || data["Image"],
            category: categoryName,
            brand: brandName,
            isBestSeller: isBestSeller, 
            oldPrice: originalDbPrice, 
            discount: realDiscount, 
          };
        }) as Product[];
        
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedCategory, showBestSellersOnly, searchQuery]);

  // Filter Logic
  const filteredProducts = products.filter((product) => {
    const matchBrand = selectedBrand 
      ? product.brand?.toString().trim().toLowerCase() === selectedBrand.toLowerCase() 
      : true;
    
    const matchCategory = selectedCategory 
      ? product.category?.toString().trim().toLowerCase() === selectedCategory.toLowerCase() 
      : true;
    
    const matchBestSeller = showBestSellersOnly ? product.isBestSeller : true;

    let matchSearch = true;
    if (searchQuery) {
      const pName = normalizeText(product.name);
      const pModel = normalizeText(product.model);
      const pBrand = normalizeText(product.brand);
      const pCategory = normalizeText(product.category);

      matchSearch = 
        pName.includes(searchQuery) || 
        pModel.includes(searchQuery) ||
        pBrand.includes(searchQuery) ||
        pCategory.includes(searchQuery);
    }
    
    return matchBrand && matchCategory && matchBestSeller && matchSearch;
  });

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const toggleBrand = (brandVal: string) => {
    setSelectedBrand(prev => prev === brandVal ? null : brandVal);
  };
  const toggleCategory = (catVal: string) => {
    setSelectedCategory(prev => prev === catVal ? null : catVal);
  };
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' }); 
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      
      {/* ✅ ADDED VIDEO BANNER HERE (First thing in main) */}
      <HeroVideo />

      {/* ================= Top Categories (Optional - Visible) ================= */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-800 mb-6">تسوق حسب القسم</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`
                  flex-shrink-0 cursor-pointer rounded-2xl p-4 flex flex-col items-center gap-3 transition-all border-2 w-32 md:w-40
                  ${selectedCategory === cat.value 
                    ? "border-sky-500 bg-sky-50 shadow-md scale-105" 
                    : "border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200"}
                `}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain mix-blend-multiply" 
                />
                <span className={`font-bold text-center text-sm md:text-base ${selectedCategory === cat.value ? "text-sky-600" : "text-gray-700"}`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Top Brands (Optional - Visible) ================= */}
      <section className="bg-white py-6 border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar items-center">
            <span className="font-bold text-gray-500 ml-4 whitespace-nowrap hidden md:block">الماركات:</span>
            {BRANDS.map((brand) => (
              <button
                key={brand.value}
                onClick={() => toggleBrand(brand.value)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center bg-white min-w-[100px] h-[60px]
                  ${selectedBrand === brand.value 
                    ? "border-sky-500 shadow-md ring-2 ring-sky-100" 
                    : "border-gray-200 hover:border-sky-300 grayscale hover:grayscale-0"}
                `}
              >
                <img src={brand.logo} alt={brand.name} className="h-full object-contain max-w-[80px]" />
              </button>
            ))}
            
            {(selectedBrand || selectedCategory || showBestSellersOnly || searchQuery) && (
              <button 
                onClick={() => { 
                    setSelectedBrand(null); 
                    setSelectedCategory(null); 
                    setShowBestSellersOnly(false);
                }}
                className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition mr-auto whitespace-nowrap flex items-center gap-1"
              >
                <span>مسح</span> <span className="hidden md:inline">الفلاتر</span> ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ================= Main Content ================= */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* ✅ SIDEBAR AREA (UPDATED) */}
        <aside className="hidden lg:block w-1/4 sticky top-24 h-fit space-y-4">
          
          {/* 1. Best Sellers Toggle (Kept Separate) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-sky-100">
             <label className="flex items-center gap-3 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500 cursor-pointer" 
                  checked={showBestSellersOnly}
                  onChange={(e) => setShowBestSellersOnly(e.target.checked)}
                />
                <span className={`font-bold transition ${showBestSellersOnly ? "text-sky-600" : "text-gray-700 group-hover:text-sky-600"}`}>
                  الأكثر مبيعاً 🔥
                </span>
              </label>
          </div>

          {/* 2. The Filter Sidebar Component */}
          {/* Social Sidebar is now INSIDE FilterSidebar, so we remove the duplicate here */}
          <FilterSidebar 
            brands={brandNames}
            categories={categoryNames}
            selectedBrand={selectedBrand || ""}
            selectedCategory={selectedCategory || ""}
            onSelectBrand={(b) => setSelectedBrand(b === selectedBrand ? null : b)}
            onSelectCategory={(c) => setSelectedCategory(c === selectedCategory ? null : c)}
          />

        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 px-1">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
               {searchQuery ? `نتائج البحث عن: "${rawSearchQuery}"` : (selectedCategory || "كل المنتجات")}
               {selectedBrand && <span className="text-sky-600 text-base">/ {selectedBrand}</span>}
               {showBestSellersOnly && <span className="text-amber-500 text-base">/ الأكثر مبيعاً</span>}
             </h2>
             <span className="text-gray-500 text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">{filteredProducts.length} منتج</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-xl text-gray-400 font-bold mb-2">عفواً، لا توجد منتجات تطابق بحثك 🔍</p>
              <button 
                onClick={() => { 
                    setSelectedBrand(null); 
                    setSelectedCategory(null); 
                    setShowBestSellersOnly(false);
                }}
                className="text-white bg-sky-500 px-6 py-2 rounded-full font-bold hover:bg-sky-600 transition"
              >
                عرض كل المنتجات
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100/90 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200">
                        {product.brand}
                      </span>
                    </div>

                    <div className="absolute top-4 left-0 z-20 flex flex-col items-start gap-1 pointer-events-none">
                        {product.isBestSeller && (
                        <div className="bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-r-md shadow-sm">
                          الأكثر مبيعاً 🔥
                        </div>
                        )}
                        {product.discount && product.discount > 0 ? (
                        <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-r-md shadow-sm">
                          خصم {product.discount}%
                        </div>
                        ) : null}
                    </div>

                    <Link href={`/product/${product.id}`} className="contents">
                      <div className="relative h-48 w-full mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-4 cursor-pointer">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="object-contain max-h-full max-w-full transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 flex flex-col cursor-pointer">
                        <h3 className="text-gray-800 font-bold text-lg leading-tight mb-0.5 line-clamp-2 min-h-[3rem] group-hover:text-sky-600 transition-colors" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-xs font-semibold mb-3 font-mono">
                          {product.model}
                        </p>
                      </div>
                    </Link>
                      
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">السعر</span>
                        
                        <div className="flex flex-col items-start">
                          {product.discount && product.discount > 0 ? (
                            <span className="text-xs text-gray-400 line-through decoration-red-400">
                              {product.oldPrice?.toLocaleString()}
                            </span>
                          ) : null}
                          <span className="text-xl font-black text-red-600">
                            {product.price?.toLocaleString()} 
                            <span className="text-xs text-red-400 font-normal mr-1">ج.م</span>
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          addToCart(product);
                        }}
                        className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center justify-center z-30 relative"
                        title="أضف للسلة"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-600"
                  >
                    السابق
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      (number === 1 || number === totalPages || (number >= currentPage - 1 && number <= currentPage + 1)) ? (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`
                          w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all
                          ${currentPage === number 
                            ? "bg-sky-500 text-white shadow-lg shadow-sky-200 scale-110" 
                            : "bg-white border text-gray-600 hover:bg-gray-50"}
                        `}
                      >
                        {number}
                      </button>
                    ) : (number === currentPage - 2 || number === currentPage + 2) ? <span key={number} className="text-gray-400">...</span> : null
                  ))}

                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-600"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <HomeContent />
    </Suspense>
  );
}
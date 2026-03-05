"use client";

import Link from "next/link"; 

interface ProductProps {
  product: {
    id: string; 
    name: string;
    price: number;
    image: string;
    brand: string;
    category: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      {/* حدود البطاقة sky-100 */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-sky-100 hover:border-sky-300 flex flex-col h-full group cursor-pointer">
        
        {/* خلفية الصورة sky-50 */}
        <div className="relative h-48 w-full bg-sky-50 flex items-center justify-center p-4 group-hover:bg-white transition-colors duration-300">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-contain hover:scale-105 transition-transform duration-300 mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x300?text=No+Image";
              }}
            />
          ) : (
            <span className="text-sky-300 text-sm">لا توجد صورة</span>
          )}
          {/* الشارة (Badge) بلون sky-400 */}
          <span className="absolute top-2 right-2 bg-sky-400 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
            {product.brand}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <p className="text-xs text-sky-400 font-medium mb-1">{product.category}</p>
          <h3 className="text-black font-bold text-sm leading-tight mb-2 line-clamp-2 flex-grow group-hover:text-sky-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-sky-50">
            <div className="text-lg font-black text-sky-600">
              {product.price.toLocaleString()} <span className="text-xs font-normal text-black">ج.م</span>
            </div>
            <div className="bg-white border-2 border-sky-400 text-sky-400 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
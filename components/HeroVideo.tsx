"use client";

export default function HeroVideo() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6 mb-8">
      
      {/* 1. The Video Container (Clean, no text on top) */}
      <div className="relative w-full h-[200px] md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-200">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          {/* Ensure 'banner.mp4' is in your 'public' folder */}
          <source src="/banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 2. The Text Section (Now Under the Video) */}
      <div className="text-center mt-6">
        <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-3">
          مرحباً بك في المنصور
        </h1>
        <p className="text-base md:text-xl font-medium text-gray-600 max-w-2xl mx-auto leading-relaxed">
          وجهتك الأولى لأحدث الأجهزة الكهربائية والمنزلية بأفضل الأسعار
        </p>
      </div>

    </div>
  );
}
import Link from "next/link";

export default function SuccessPage() {
  // رقم طلب عشوائي
  const orderNumber = Math.floor(Math.random() * 1000000);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100">
        
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🎉</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">تم استلام طلبك!</h1>
        <p className="text-gray-500 mb-8">شكراً لثقتك بنا. سيتم توصيل طلبك قريباً.</p>

        <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
          <p className="text-2xl font-mono font-bold text-blue-600">#{orderNumber}</p>
        </div>

        <Link href="/" className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
          العودة للتسوق 🛍️
        </Link>

      </div>
    </div>
  );
}
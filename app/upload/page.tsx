"use client";

import { useState } from "react";
import { db } from "../../lib/firebase"; 
import { collection, addDoc } from "firebase/firestore"; 

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // دالة لقراءة ملف CSV وتحويله لبيانات
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = async (csvText: string) => {
    // تقسيم النص إلى أسطر
    const lines = csvText.split("\n");
    const products = [];

    // تخطي السطر الأول (العناوين) والبدء من الثاني
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // تقسيم السطر بناءً على الفواصل (مع مراعاة النصوص المحاطة بعلامات تنصيص)
      // هذا التعبير النمطي يقسم بالنصوص ولكن يتجاهل الفواصل داخل علامات التنصيص
      const columns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");

      // تنظيف البيانات من علامات التنصيص الزائدة
      const cleanCols = columns.map(col => col.replace(/^"|"$/g, '').trim());

      // التأكد من أن السطر يحتوي على بيانات كافية
      if (cleanCols.length < 5) continue;

      // ترتيب الأعمدة حسب ملفك:
      // 0: Brand, 1: Model Name, 2: Description, 3: Price, 4: Category, 5: Image
      const brand = cleanCols[0];
      const model = cleanCols[1];
      const description = cleanCols[2];
      const price = cleanCols[3];
      const category = cleanCols[4];
      const image = cleanCols[5] || ""; // في حال لم توجد صورة

      products.push({
        name: `${brand} ${description}`, // اسم المنتج مركب
        brand: brand,
        model: model,
        description: description,
        price: Number(price.replace(/[^0-9.]/g, "")), // استخراج الرقم فقط للسعر
        category: category,
        image: image
      });
    }

    if (confirm(`تم استخراج ${products.length} منتج من الملف. هل تريد بدء الرفع لـ Firebase؟`)) {
      uploadToFirebase(products);
    }
  };

  const uploadToFirebase = async (products: any[]) => {
    setLoading(true);
    setLogs([]);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        await addDoc(collection(db, "products"), product);
        successCount++;
        setLogs(prev => [`✅ (${i+1}/${products.length}) تم رفع: ${product.name}`, ...prev]);
      } catch (error) {
        console.error(error);
        failCount++;
        setLogs(prev => [`❌ فشل رفع: ${product.name}`, ...prev]);
      }
      // تحديث شريط التقدم
      setProgress(Math.round(((i + 1) / products.length) * 100));
    }

    setLoading(false);
    alert(`تمت العملية!\nنجح: ${successCount}\nفشل: ${failCount}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">رفع المنتجات من ملف Excel/CSV 📂</h1>
        
        {/* منطقة رفع الملف */}
        {!loading && (
          <div className="border-4 border-dashed border-blue-100 rounded-xl p-10 bg-blue-50 hover:bg-blue-100 transition cursor-pointer relative">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-blue-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="font-bold text-lg">اضغط هنا لاختيار ملف "products.csv"</p>
              <p className="text-sm mt-2 text-gray-400">تأكد أن الملف بصيغة CSV</p>
            </div>
          </div>
        )}

        {/* شريط التقدم */}
        {loading && (
          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
              <span>جاري الرفع...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* سجل العمليات */}
        <div className="mt-8 bg-gray-900 rounded-xl p-4 h-64 overflow-y-auto text-right" dir="ltr">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center mt-20 text-sm">بانتظار الملف...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-xs font-mono mb-1 border-b border-gray-800 pb-1 last:border-0">
                {log.includes("✅") ? <span className="text-green-400">{log}</span> : <span className="text-red-400">{log}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
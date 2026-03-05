"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore"; 
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { db, auth } from "../../lib/firebase"; 
import { useRouter } from "next/navigation"; 
import { ADMIN_EMAIL } from "../../lib/config"; 

// Interfaces
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  description?: string;
  model?: string;
  stock?: number;
  [key: string]: any;
}

interface Order {
  id: string;
  client: { name: string; phone: string; address: string };
  status: string;
  total: number;
  createdAt: any;
  items: any[];
  paymentMethod?: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("add_product");
  const router = useRouter();

  // --- General States ---
  const [searchTerm, setSearchTerm] = useState(""); 

  // --- Add Product States ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", brand: "", category: "", price: "", image: "", description: "", discount: "10", model: "", stock: "5"
  });

  // --- Orders States ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // --- Products/Stock States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Fields
  const [editOriginalPrice, setEditOriginalPrice] = useState<string>("");
  const [editDiscount, setEditDiscount] = useState<string>("");
  const [editStock, setEditStock] = useState<string>("");

  // Auth Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const cleanAdminEmail = ADMIN_EMAIL?.trim().toLowerCase();
      if (!currentUser) {
        router.push("/login");
      } else {
        const currentUserEmail = currentUser.email?.toLowerCase();
        if (currentUserEmail !== cleanAdminEmail) {
          router.push("/");
        } else {
          setUser(currentUser);
          fetchOrders();
          fetchProducts();
        }
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // --- Filter Products ---
  const getFilteredProducts = () => {
    if (!searchTerm) return products;
    
    const lowerTerm = searchTerm.toLowerCase().trim();

    return products.filter(p => {
        const name = p.name ? p.name.toLowerCase() : "";
        const category = p.category ? p.category.toLowerCase() : "";
        const brand = p.brand ? p.brand.toLowerCase() : "";
        const model = p.model ? p.model.toLowerCase() : "";

        return (
            name.includes(lowerTerm) || 
            category.includes(lowerTerm) || 
            brand.includes(lowerTerm) ||
            model.includes(lowerTerm)
        );
    });
  };

  // --- Filter Orders ---
  const getFilteredOrders = () => {
    if (!searchTerm) return orders;
    const lowerTerm = searchTerm.toLowerCase().trim();

    return orders.filter(o => 
      (o.client?.name && o.client.name.toLowerCase().includes(lowerTerm)) || 
      (o.client?.phone && o.client.phone.includes(lowerTerm)) ||
      o.id.toLowerCase().includes(lowerTerm)
    );
  };

  // --- Formatters ---
  const formatPrice = (price: any) => {
    if (price === undefined || price === null) return "0";
    const cleanString = price.toString().replace(/,/g, '').replace(/[^\d.]/g, '');
    const number = parseFloat(cleanString);
    return isNaN(number) ? "0" : number.toLocaleString();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ar-EG', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
    } catch (e) { return ""; }
  };

  // --- Fetch Data ---
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) { console.error("Error fetching orders:", error); }
    setLoadingOrders(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) { console.error("Error fetching products:", error); }
    setLoadingProducts(false);
  };

  // --- Operations ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert("حدث خطأ أثناء تحديث الحالة");
    }
  };

  const applyBulkDiscount = async (discountValue: number) => {
    if (!confirm(`⚠️ هل أنت متأكد؟ سيتم تطبيق خصم ${discountValue}% على جميع المنتجات الحالية!`)) return;
    
    setLoadingProducts(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const promises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let original = data.originalPrice ? Number(data.originalPrice) : Number(data.price);
        if (!original) original = Number(data.price);
        
        const newPrice = Math.round(original * (1 - discountValue/100));
        
        return updateDoc(doc(db, "products", docSnap.id), {
          originalPrice: original,
          discount: discountValue,
          price: newPrice,
          Price: newPrice 
        });
      });
      await Promise.all(promises);
      alert(`✅ تم تطبيق خصم ${discountValue}% بنجاح!`);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("❌ حدث خطأ أثناء التحديث");
    }
    setLoadingProducts(false);
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const originalPrice = Number(formData.price);
      const discount = Number(formData.discount);
      const stock = Number(formData.stock);
      const finalPrice = Math.round(originalPrice * (1 - discount/100));

      await addDoc(collection(db, "products"), {
        ...formData, 
        originalPrice: originalPrice,
        price: finalPrice,
        Price: finalPrice,
        discount: discount,
        stock: stock,
        createdAt: new Date(),
        name: formData.name.trim(),
        model: formData.model.trim(), 
      });
      
      alert("✅ تمت إضافة المنتج بنجاح");
      setFormData({ name: "", brand: "", category: "", price: "", image: "", description: "", discount: "10", model: "", stock: "5" });
      fetchProducts();
    } catch (error) { 
      console.error(error);
      alert("❌ حدث خطأ"); 
    }
    setLoading(false);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditOriginalPrice(product.originalPrice ? product.originalPrice.toString() : product.price.toString());
    setEditDiscount(product.discount ? product.discount.toString() : "0");
    setEditStock(product.stock !== undefined ? product.stock.toString() : "5");
  };

  const saveProductEdit = async (id: string) => {
    const original = Number(editOriginalPrice);
    const disc = Number(editDiscount);
    const stockVal = Number(editStock);
    const newPrice = Math.round(original * (1 - disc / 100));

    try {
      await updateDoc(doc(db, "products", id), {
        originalPrice: original,
        discount: disc,
        price: newPrice,
        Price: newPrice,
        stock: stockVal
      });
      
      setProducts(prev => prev.map(p => p.id === id ? { 
          ...p, 
          originalPrice: original, 
          discount: disc, 
          price: newPrice,
          stock: stockVal
      } : p));
      
      setEditingId(null);
    } catch (error) { alert("❌ فشل التحديث"); }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm("حذف الطلب نهائياً؟")) { 
      try {
        await deleteDoc(doc(db, "orders", id)); 
        setOrders(prev => prev.filter(o => o.id !== id));
      } catch (e) {
        alert("فشل الحذف");
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (checkingAuth || !user) return <div className="min-h-screen flex justify-center items-center text-sky-600 font-bold">جاري التحقق...</div>;

  return (
    <div className="min-h-screen bg-sky-50" dir="rtl">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-sky-100 p-4 sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-sky-600">لوحة التحكم ⚙️</h1>
          <span className="hidden md:block bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full font-mono">{user.email?.split('@')[0]}</span>
        </div>
        <div className="flex gap-3">
           <button onClick={() => {fetchOrders(); fetchProducts();}} className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-sky-500 bg-gray-50 px-3 py-2 rounded-lg transition">تحديث 🔄</button>
           <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">خروج 🚪</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl shadow-sm p-1.5 mb-6 border border-sky-100 overflow-x-auto">
          <button onClick={() => {setActiveTab("add_product"); setSearchTerm("");}} className={`flex-1 py-3 px-4 whitespace-nowrap rounded-xl font-bold transition ${activeTab === "add_product" ? "bg-sky-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>إضافة منتج 📦</button>
          <button onClick={() => {setActiveTab("edit_prices"); setSearchTerm("");}} className={`flex-1 py-3 px-4 whitespace-nowrap rounded-xl font-bold transition ${activeTab === "edit_prices" ? "bg-sky-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>المخزون والأسعار ({products.length}) 🏷️</button>
          <button onClick={() => {setActiveTab("orders"); setSearchTerm("");}} className={`flex-1 py-3 px-4 whitespace-nowrap rounded-xl font-bold transition ${activeTab === "orders" ? "bg-sky-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>الطلبات ({orders.length}) 📄</button>
        </div>

        {/* Search Bar */}
        {activeTab !== "add_product" && (
           <div className="mb-6 relative">
              <input 
                type="text" 
                placeholder={activeTab === "orders" ? "ابحث برقم التليفون، اسم العميل..." : "ابحث باسم المنتج، الماركة، أو الموديل..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-200 shadow-sm"
              />
              <span className="absolute top-3.5 right-3 text-gray-400">🔍</span>
           </div>
        )}

        {/* --- Tab 1: Add Product --- */}
        {activeTab === "add_product" && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-sky-100">
             <h2 className="text-xl font-bold text-gray-800 mb-6 border-r-4 border-sky-500 pr-3">إضافة منتج جديد</h2>
             <form onSubmit={handleAddProduct} className="space-y-5">
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="اسم المنتج (مثال: ثلاجة شارب 18 قدم)" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="رقم الموديل (Model Number)" />
                  <div className="relative">
                      <label className="absolute -top-2 right-3 bg-white px-1 text-xs text-sky-600 font-bold">المخزون (العدد)</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="الكمية المتاحة (مثال: 5)" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select name="brand" value={formData.brand} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black">
                    <option value="">اختار الماركة</option>
                    {["Samsung", "LG", "Tornado", "Sharp", "Toshiba", "Fresh", "Beko", "Sony", "Unionaire", "Kiriazi", "Hoover", "La Germania", "Haier", "Carrier", "Zanussi"].map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black">
                    <option value="">اختار القسم</option>
                    {["شاشات", "ثلاجات", "غسالات ملابس", "تكييفات", "بوتاجازات", "سخانات", "أفران", "غسالات أطباق", "مكانس", "خلاطات", "أجهزة صغيرة"].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-bold text-gray-500 mb-1 block">السعر الأصلي</label>
                    <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="0.00" />
                  </div>
                  <div className="w-1/3">
                    <label className="text-sm font-bold text-gray-500 mb-1 block">نسبة الخصم %</label>
                    <input required type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="%" />
                  </div>
                </div>
                <input required type="url" name="image" value={formData.image} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="رابط الصورة" />
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-black" placeholder="وصف المنتج..." />
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold py-4 rounded-xl hover:from-sky-600 hover:to-sky-700 transition shadow-lg text-lg">
                  {loading ? "جاري الحفظ..." : "حفظ المنتج ✨"}
                </button>
             </form>
          </div>
        )}

        {/* --- Tab 2: Edit Prices & Stock --- */}
        {activeTab === "edit_prices" && (
          <div className="bg-white rounded-3xl shadow-xl border border-sky-100 overflow-hidden">
             <div className="p-6 bg-sky-50 border-b border-sky-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                 <h2 className="text-xl font-black text-gray-800">إدارة المخزون والأسعار</h2>
                 <p className="text-sm text-gray-500">تطبيق خصم جماعي على <span className="font-bold text-red-500">كل المنتجات</span>:</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => applyBulkDiscount(10)} disabled={loadingProducts} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg font-bold text-sm transition">10%</button>
                 <button onClick={() => applyBulkDiscount(15)} disabled={loadingProducts} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-2 rounded-lg font-bold text-sm transition">15%</button>
                 <button onClick={() => applyBulkDiscount(20)} disabled={loadingProducts} className="bg-rose-100 text-rose-700 hover:bg-rose-200 px-3 py-2 rounded-lg font-bold text-sm transition">20%</button>
               </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-right min-w-[700px]">
                 <thead className="bg-gray-50 text-gray-700 border-b">
                   {/* ✅ FIX: Cleaned header structure to prevent hydration error */}
                   <tr>
                     <th className="p-4">المنتج</th>
                     <th className="p-4 w-24 text-center">المخزون</th>
                     <th className="p-4 text-center">السعر الأصلي</th>
                     <th className="p-4 text-center">الخصم %</th>
                     <th className="p-4 text-center">النهائي</th>
                     <th className="p-4 text-center">تحكم</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {getFilteredProducts().map((product) => (
                     <tr key={product.id} className="hover:bg-gray-50 transition">
                       <td className="p-4 flex items-center gap-3">
                         <img src={product.image} className="w-12 h-12 object-contain rounded border bg-white" alt="img" />
                         <div>
                            <span className="font-bold text-gray-800 text-sm max-w-[200px] truncate block" title={product.name}>{product.name}</span>
                            <span className="text-xs text-gray-400 block">{product.brand} {product.model ? `- ${product.model}` : ''}</span>
                         </div>
                       </td>

                       {editingId === product.id ? (
                         <>
                           <td className="p-4 text-center">
                               <input type="number" className="border-2 border-orange-300 p-1 rounded w-16 text-center text-black bg-orange-50 font-bold" value={editStock} onChange={e => setEditStock(e.target.value)} />
                           </td>
                           <td className="p-4 text-center"><input type="number" className="border-2 border-sky-300 p-1 rounded w-20 text-center text-black" value={editOriginalPrice} onChange={e => setEditOriginalPrice(e.target.value)} /></td>
                           <td className="p-4 text-center"><input type="number" className="border-2 border-sky-300 p-1 rounded w-14 text-center text-black" value={editDiscount} onChange={e => setEditDiscount(e.target.value)} /></td>
                           <td className="p-4 text-center font-bold text-green-600">{Math.round(Number(editOriginalPrice) * (1 - Number(editDiscount)/100)).toLocaleString()}</td>
                           <td className="p-4 flex justify-center gap-2">
                             <button onClick={() => saveProductEdit(product.id)} className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold text-xs hover:bg-green-600">حفظ</button>
                             <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-gray-300">إلغاء</button>
                           </td>
                         </>
                       ) : (
                         <>
                           <td className="p-4 text-center">
                               <span className={`px-2 py-1 rounded text-sm font-bold ${(!product.stock || product.stock === 0) ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'}`}>
                                   {product.stock !== undefined ? product.stock : 5}
                               </span>
                           </td>
                           <td className="p-4 text-center text-gray-400 line-through text-sm">{(product.originalPrice || product.price)?.toLocaleString()}</td>
                           <td className="p-4 text-center text-red-500 font-bold text-sm">{product.discount || 0}%</td>
                           <td className="p-4 text-center text-sky-600 font-black">{product.price.toLocaleString()}</td>
                           <td className="p-4 text-center">
                             <button onClick={() => startEdit(product)} className="text-sky-600 hover:text-sky-800 font-bold text-sm underline">تعديل</button>
                           </td>
                         </>
                       )}
                     </tr>
                   ))}
                   {getFilteredProducts().length === 0 && (
                       <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد منتجات مطابقة للبحث</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* --- Tab 3: Orders --- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {getFilteredOrders().length === 0 ? <p className="text-center text-gray-400 py-10">لا توجد طلبات مطابقة</p> : 
              getFilteredOrders().map((order) => (
                <div key={order.id} className={`bg-white p-6 rounded-2xl shadow-sm border relative transition hover:shadow-md ${order.status === 'تم التوصيل' ? 'border-green-200 bg-green-50/30' : 'border-sky-100'}`}>
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-12 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-sky-600 text-lg">{order.client?.name || "عميل غير معروف"}</h3>
                           {/* ✅ FIX: Added suppressHydrationWarning for dates */}
                           <span suppressHydrationWarning className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{formatDate(order.createdAt)}</span>
                        </div>
                        <a href={`tel:${order.client?.phone}`} className="text-gray-500 text-sm hover:text-sky-500 font-mono block mb-1">📞 {order.client?.phone}</a>
                        <p className="text-gray-500 text-xs leading-relaxed max-w-xl bg-gray-50 p-2 rounded">{order.client?.address}</p>
                      </div>
                      
                      {/* Status Change */}
                      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                          <select 
                            value={order.status || "pending"} 
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`text-sm font-bold py-2 px-4 rounded-xl border outline-none cursor-pointer w-full md:w-auto ${
                              order.status === 'تم التوصيل' ? 'bg-green-100 text-green-700 border-green-200' : 
                              order.status === 'تم الشحن' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                              'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            <option value="pending">⏳ قيد الانتظار</option>
                            <option value="تم الشحن">🚚 تم الشحن</option>
                            <option value="تم التوصيل">✅ تم التوصيل</option>
                            <option value="ملغي">❌ ملغي</option>
                          </select>
                      </div>
                  </div>
                  
                  <button onClick={() => handleDeleteOrder(order.id)} className="absolute top-4 left-4 text-red-300 hover:text-red-500 transition p-2" title="حذف الطلب">🗑️</button>

                  {/* Items Details */}
                  <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-3 custom-scrollbar max-h-60 overflow-y-auto border border-gray-100">
                    {order.items?.map((item:any, i:number) => (
                       <div key={i} className="flex justify-between items-center text-black border-b border-gray-200 pb-2 last:border-0">
                         <div className="flex items-center gap-3">
                            <span className="font-bold text-white bg-sky-400 w-6 h-6 flex items-center justify-center rounded-full text-xs">{item.quantity}</span>
                            <div className="flex flex-col">
                               <span className="font-medium">{item.name}</span>
                               {item.model && <span className="text-[10px] text-gray-400 font-mono">Model: {item.model}</span>}
                            </div>
                         </div>
                         <span className="font-bold text-sky-600 whitespace-nowrap">{formatPrice(item.price)} ج.م</span>
                       </div>
                    ))}
                  </div>
                  
                  {/* Footer: Total */}
                  <div className="mt-4 pt-3 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold">الدفع: {order.paymentMethod || "كاش"}</span>
                    <div className="font-black text-xl text-sky-700">
                      الإجمالي: {formatPrice(order.total)} ج.م
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
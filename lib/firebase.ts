// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 👇 ضع بياناتك هنا التي أخذتها من موقع فايربيس
const firebaseConfig = {
  apiKey: "AIzaSyAYFQMKvxDkWzTkdlNYcwLF9ABYJ2ZKgf0",
  authDomain: "mansour-4e3f3.firebaseapp.com",
  projectId: "mansour-4e3f3",
  storageBucket: "mansour-4e3f3.firebasestorage.app",
  messagingSenderId: "1034311265127",
  appId: "1:1034311265127:web:c52cb5da957f9d989dddc2"
};

// تهيئة التطبيق (تمنع إعادة التهيئة المتكررة)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app); // 👈 تشغيل خدمة المصادقة


export { db, auth }; // 👈 تصدير auth لنستخدمه في الصفحات


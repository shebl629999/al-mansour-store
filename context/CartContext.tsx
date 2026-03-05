"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useRouter } from "next/navigation";

// 1. Define Types
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number; // Quantity is optional initially but we force it to exist in the cart
};

type CartContextType = {
  cart: Product[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  decreaseQuantity: (productId: string) => Promise<void>; // New helper
  clearCart: () => Promise<void>;
  cartTotal: number; // Helper to avoid NaN in UI
  loading: boolean;
};

// 2. Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Watch Auth State & Fetch Cart
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const cartRef = doc(db, "carts", currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(cartRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure all items have a valid price and quantity to prevent NaN
            const safeCart = (data.items || []).map((item: Product) => ({
              ...item,
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
            }));
            setCart(safeCart);
          } else {
            setCart([]);
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setCart([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync with Firestore Helper
  const syncCartToFirebase = async (newCart: Product[], userId: string) => {
    try {
      await setDoc(doc(db, "carts", userId), { items: newCart }, { merge: true });
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  // ✅ FIX: Smart Add to Cart (Increments Quantity & Prevents NaN)
  const addToCart = async (product: Product) => {
    if (!user) {
      // Save intent to add to cart in local storage or just redirect
      if (confirm("يجب تسجيل الدخول لإضافة منتجات للسلة. الذهاب للدخول؟")) {
        router.push("/login");
      }
      return;
    }

    const price = Number(product.price) || 0;
    const safeProduct = { ...product, price, quantity: 1 };

    let updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // Item exists, increment quantity
      updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 1) + 1;
    } else {
      // New item
      updatedCart.push(safeProduct);
    }

    setCart(updatedCart); // Instant UI update
    await syncCartToFirebase(updatedCart, user.uid);
  };

  // ✅ FIX: Decrease Quantity (Optional but good for UX)
  const decreaseQuantity = async (productId: string) => {
    if (!user) return;
    
    let updatedCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) };
      }
      return item;
    });

    setCart(updatedCart);
    await syncCartToFirebase(updatedCart, user.uid);
  };

  // Remove Item
  const removeFromCart = async (productId: string) => {
    if (!user) return;
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    await syncCartToFirebase(updatedCart, user.uid);
  };

  // Clear Cart
  const clearCart = async () => {
    if (!user) return;
    setCart([]);
    await setDoc(doc(db, "carts", user.uid), { items: [] });
  };

  // ✅ FIX: Safe Total Calculation
  const cartTotal = cart.reduce((total, item) => {
    const p = Number(item.price) || 0;
    const q = Number(item.quantity) || 1;
    return total + (p * q);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseQuantity, clearCart, cartTotal, loading }}>
      {children}
    </CartContext.Provider>
  );
}

// 4. Hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
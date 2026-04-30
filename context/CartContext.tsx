"use client";

import {
  createContext, useContext, useEffect,
  useReducer, useState, useCallback, ReactNode,
} from "react";
import { _registerCartSwitch } from "@/context/AuthContext";
import type { CartItem } from "@/types";
import { getUserStorageId } from "@/lib/userIdentity";

const guestKey = "fc_cart_guest";
const userKey = (uid: string) => `fc_cart_user_${uid}`;

function read(key: string): CartItem[] {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function write(key: string, items: CartItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}
function getUid(): string {
  try { return getUserStorageId(JSON.parse(localStorage.getItem("fc_user") ?? "null")); }
  catch { return ""; }
}

type Action =
  | { type: "LOAD"; payload: CartItem[] }
  | { type: "ADD"; payload: Omit<CartItem, "qty"> }
  | { type: "REMOVE"; payload: string }
  | { type: "UPDATE_QTY"; payload: { id: string; qty: number } }
  | { type: "CLEAR" };

function reducer(items: CartItem[], a: Action): CartItem[] {
  switch (a.type) {
    case "LOAD": return a.payload;
    case "CLEAR": return [];
    case "ADD": {
      const ex = items.find(i => i.id === a.payload.id);
      if (ex) return items.map(i => i.id === a.payload.id ? { ...i, qty: i.qty + 1 } : i);
      return [...items, { ...a.payload, qty: 1 }];
    }
    case "REMOVE": return items.filter(i => i.id !== a.payload);
    case "UPDATE_QTY": return items.map(i => i.id === a.payload.id ? { ...i, qty: Math.max(1, a.payload.qty) } : i);
    default: return items;
  }
}

interface CartCtx {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [mounted, setMounted] = useState(false);
  const [activeKey, setActiveKey] = useState(guestKey);

  useEffect(() => {
    setMounted(true);
    const uid = getUid();
    const key = uid ? userKey(uid) : guestKey;
    setActiveKey(key);
    dispatch({ type: "LOAD", payload: read(key) });
  }, []); 

  useEffect(() => {
    if (mounted) write(activeKey, items);
  }, [items, activeKey, mounted]);

  const onLogin = useCallback((uid: string) => {
    write(activeKey, items);
    const key = userKey(uid);
    setActiveKey(key);
    dispatch({ type: "LOAD", payload: read(key) });
  }, [activeKey, items]);

  const onLogout = useCallback((uid: string) => {
    write(userKey(uid), items);
    setActiveKey(guestKey);
    dispatch({ type: "CLEAR" });
  }, [items]);

  useEffect(() => { _registerCartSwitch(onLogin, onLogout); }, [onLogin, onLogout]);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    dispatch({ type: "ADD", payload: item });
    import("@/lib/toast").then(m => m.default.success("Added to cart!"));
  }, []);

  const removeItem = useCallback((id: string) => { dispatch({ type: "REMOVE", payload: id }); }, []);
  const updateQty = useCallback((id: string, qty: number) => { dispatch({ type: "UPDATE_QTY", payload: { id, qty } }); }, []);
  const clearCart = useCallback(() => { dispatch({ type: "CLEAR" }); }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

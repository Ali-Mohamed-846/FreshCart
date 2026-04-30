"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, useRef, ReactNode,
} from "react";
import { _registerWLSwitch } from "@/context/AuthContext";
import type { WishlistItem } from "@/types";
import { getUserStorageId } from "@/lib/userIdentity";

const guestKey = "fc_wl_guest";
const userKey = (uid: string) => `fc_wl_user_${uid}`;

function read(key: string): WishlistItem[] {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function write(key: string, items: WishlistItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}
function getUid(): string {
  try { return getUserStorageId(JSON.parse(localStorage.getItem("fc_user") ?? "null")); }
  catch { return ""; }
}

interface WLCtx {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  count: number;
}

const WLContext = createContext<WLCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeKey, setActiveKey] = useState(guestKey);
  const ref = useRef<WishlistItem[]>([]);
  ref.current = items;

  useEffect(() => {
    setMounted(true);
    const uid = getUid();
    const key = uid ? userKey(uid) : guestKey;
    setActiveKey(key);
    setItems(read(key));
  }, []); 

  useEffect(() => {
    if (mounted) write(activeKey, items);
  }, [items, activeKey, mounted]);

  const onLogin = useCallback((uid: string) => {
    write(activeKey, ref.current);
    const key = userKey(uid);
    setActiveKey(key);
    setItems(read(key));
  }, [activeKey]);

  const onLogout = useCallback((uid: string) => {
    write(userKey(uid), ref.current);
    setActiveKey(guestKey);
    setItems([]);
  }, []);

  useEffect(() => { _registerWLSwitch(onLogin, onLogout); }, [onLogin, onLogout]);

  const toggle = useCallback((item: WishlistItem) => {
    const cur = ref.current;
    const exists = cur.some(i => i.id === item.id);
    setItems(exists ? cur.filter(i => i.id !== item.id) : [...cur, item]);
    import("@/lib/toast").then(m => {
      if (exists) m.default("Removed from wishlist", { icon: "💔" });
      else m.default.success("Added to wishlist!");
    });
  }, []);

  const isInWishlist = useCallback((id: string) => ref.current.some(i => i.id === id), []);

  return (
    <WLContext.Provider value={{ items, toggle, isInWishlist, count: items.length }}>
      {children}
    </WLContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WLContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}

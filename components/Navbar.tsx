"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FiShoppingCart, FiHeart, FiSearch,
  FiMenu, FiX, FiChevronDown, FiUser, FiPhone, FiMail,
} from "react-icons/fi";
import Image from "next/image";
import { Truck, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { getCategories } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Category } from "@/types";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/contact", label: "Support" },
] as const;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { count: cartCount } = useCart();
  const { count: wlCount } = useWishlist();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getCategories().then(setCategories).catch(() => { }); }, []);
  useEffect(() => { setMobileOpen(false); setCatOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const linkCls = (href: string) =>
    `relative px-3 py-2 text-sm font-medium transition-colors
    ${isActive(pathname, href)
      ? "text-primary-600 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary-600"
      : "text-gray-600 hover:text-primary-600"}`;

  const mobileLinkCls = (href: string) =>
    `block px-3 py-2.5 rounded-xl text-sm font-medium transition
    ${isActive(pathname, href)
      ? "bg-primary-50 text-primary-600 font-semibold"
      : "text-gray-700 hover:bg-gray-50"}`;

  const openLogoutConfirm = () => { setUserMenuOpen(false); setMobileOpen(false); setLogoutConfirm(true); };

  return (
    <>

      <ConfirmDialog
        open={logoutConfirm}
        title="Sign Out?"
        message="Are you sure you want to sign out? Your cart and wishlist will be saved for when you return."
        confirmLabel="Yes, Sign Out"
        danger={false}
        onConfirm={() => { setLogoutConfirm(false); logout(); }}
        onCancel={() => setLogoutConfirm(false)}
      />

      <header className="sticky top-0 z-50 bg-white shadow-sm">

      
        <div className="bg-primary-600 text-white text-xs">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <p className="font-medium tracking-wide hidden sm:block" suppressHydrationWarning>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Free Shipping on Orders Over 500 EGP</span>
                </span>
                <span className="opacity-50">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Arrivals Daily</span>
                </span>
              </span>
            </p>
            <div className="flex items-center gap-4 ml-auto">
              <a href="tel:+18001234567" className="hidden md:flex items-center gap-1 hover:text-green-200 transition">
                <FiPhone className="w-3 h-3" /> +1 (800) 123-4567
              </a>
              <a href="mailto:support@freshcart.com" className="hidden md:flex items-center gap-1 hover:text-green-200 transition">
                <FiMail className="w-3 h-3" /> support@freshcart.com
              </a>
              <span className="opacity-30 hidden md:block">|</span>
              {user ? (
                <span className="font-semibold text-xs">{user.name}</span>
              ) : (
                <>
                  <Link href="/login" className="hover:text-green-200 transition text-xs">Sign In</Link>
                  <Link href="/register" className="hover:text-green-200 transition text-xs">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>

      
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-3">

        
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 select-none">
              <Image
                src="/favicon.png"
                alt="FreshCart"
                width={32}
                height={32}
                priority
                unoptimized
                className="w-8 h-8 object-contain"
              />
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                FreshCart
              </span>
            </Link>

          
            <form onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-lg items-center border border-gray-200 rounded-full bg-white shadow-sm focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition pl-5 pr-1.5 py-1.5">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="flex-1 min-w-0 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400" />
              <button type="submit"
                className="flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white w-9 h-9 rounded-full flex items-center justify-center transition">
                <FiSearch className="w-4 h-4" />
              </button>
            </form>

        
            <nav className="hidden md:flex items-center gap-0.5 h-full">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className={linkCls(l.href)}>{l.label}</Link>
              ))}

             
              <div ref={catRef} className="relative h-full flex items-center">
                <button onClick={() => setCatOpen(o => !o)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1
                    ${isActive(pathname, "/categories") ? "text-primary-600" : "text-gray-600 hover:text-primary-600"}`}>
                  Categories
                  <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
                </button>
                {catOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 w-64 z-[999]">
                    <Link href="/categories" onClick={() => setCatOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-green-50 hover:text-primary-600 transition">
                       All Categories
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <div className="max-h-72 overflow-y-auto">
                      {categories.map(cat => (
                        <Link key={cat._id}
                          href={`/products?catId=${cat._id}&catName=${encodeURIComponent(cat.name)}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-primary-600 transition">
                          <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image src={cat.image} alt={cat.name} width={28} height={28}
                              className="w-full h-full object-cover" unoptimized
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </div>
                          <span className="flex-1">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

          
            <div className="flex items-center gap-1.5 ml-auto md:ml-0">
              <Link href="/contact"
                className="hidden lg:flex flex-col items-center justify-center w-14 h-10 text-gray-600 hover:text-primary-600 transition">
                <FiPhone className="w-4 h-4" />
                <span className="text-[9px] font-semibold mt-0.5 leading-none">Support</span>
                <span className="text-[9px] text-gray-400 leading-none">24/7 Help</span>
              </Link>

            
              <Link href="/wishlist"
                className={`relative hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition
                  ${isActive(pathname, "/wishlist") ? "bg-red-50 text-red-500" : "hover:bg-gray-100 text-gray-600 hover:text-red-400"}`}>
                <FiHeart className="w-5 h-5" fill={isActive(pathname, "/wishlist") ? "currentColor" : "none"} />
                {wlCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {wlCount > 9 ? "9+" : wlCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart"
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition
                  ${isActive(pathname, "/cart") ? "bg-green-50 text-primary-600" : "hover:bg-gray-100 text-gray-600 hover:text-primary-600"}`}>
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

           
              {user ? (
                <div ref={userRef} className="relative hidden md:block">
                  <button onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 px-3 py-2 rounded-xl text-sm font-semibold transition">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden lg:block">{user.name.split(" ")[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-50">
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">My Account</Link>
                      <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">Wishlist</Link>
                      <Link href="/cart" onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">Cart</Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={openLogoutConfirm}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login"
                  className="hidden md:flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                  <FiUser className="w-4 h-4" />
                  <span className="hidden lg:block">Sign In</span>
                </Link>
              )}

           
              <button onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition">
                {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

         
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-1 pb-5">
              <form onSubmit={handleSearch} className="flex mb-3">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="flex-1 border border-gray-300 border-r-0 rounded-l-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                <button type="submit" className="bg-primary-600 text-white px-3 rounded-r-xl hover:bg-primary-700 transition">
                  <FiSearch className="w-4 h-4" />
                </button>
              </form>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className={mobileLinkCls(l.href)}>{l.label}</Link>
              ))}
              <Link href="/categories" className={mobileLinkCls("/categories")}>Categories</Link>
              <div className="flex gap-2 pt-3">
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center border border-primary-600 text-primary-600 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition">
                      Account
                    </Link>
                    <button onClick={openLogoutConfirm}
                      className="flex-1 text-center bg-red-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center bg-primary-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center border border-primary-600 text-primary-600 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiHeart, FiShoppingCart, FiShare2, FiChevronRight,
  FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { getProduct, getProducts } from "@/lib/api";
import { Spinner } from "@/components/UI";
import ProductCard from "@/components/ProductCard";
import toast from "@/lib/toast";
import type { Product } from "@/types";

const TABS = ["Description", "Reviews", "Shipping & Returns"] as const;
type Tab = (typeof TABS)[number];

const COLORS_FASHION = ["#1a1a1a", "#ffffff", "#ef4444", "#3b82f6", "#f59e0b", "#6b7280", "#84cc16", "#ec4899"];
const SIZES_CLOTHES = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZES_SHOES = ["38", "39", "40", "41", "42", "43", "44", "45"];


const BUY_NOW_KEY = "fc_buy_now";

export function setBuyNowItem(item: { id: string; title: string; price: number; image: string; qty: number; color?: string; size?: string }) {
  sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
}

export function getBuyNowItem() {
  try { return JSON.parse(sessionStorage.getItem(BUY_NOW_KEY) ?? "null"); } catch { return null; }
}

export function clearBuyNowItem() {
  sessionStorage.removeItem(BUY_NOW_KEY);
}

function Stars({ rating, size = "base" }: { rating: number; size?: "sm" | "base" | "lg" }) {
  const cls = size === "lg" ? "text-xl" : size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={cls}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}>★</span>
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState("");
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(COLORS_FASHION[0]);
  const [size, setSize] = useState("");
  const [tab, setTab] = useState<Tab>("Description");

  useEffect(() => {
    if (!id) return;
    setLoading(true); setQty(1); setTab("Description");
    getProduct(id)
      .then(p => {
        setProduct(p);
        setMainImg(p.imageCover);
        getProducts({ limit: 10, category: p.category?._id })
          .then(r => setRelated(r.data.filter(x => x._id !== p._id).slice(0, 5)));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="py-32" />;
  if (!product) return (
    <div className="text-center py-32">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-500 mb-3">Product not found.</p>
      <Link href="/products" className="text-primary-600 hover:underline">← Back to Shop</Link>
    </div>
  );

  const hasDisc = !!product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const discPct = hasDisc ? Math.round((1 - product.priceAfterDiscount! / product.price) * 100) : 0;
  const price = hasDisc ? product.priceAfterDiscount! : product.price;
  const inWl = isInWishlist(product._id);
  const allImgs = [...new Set([product.imageCover, ...(product.images ?? [])])].filter(Boolean);
  const totalPrice = (price * qty).toFixed(2);

  const catName = (product.category?.name ?? "").toLowerCase();
  const isShoes = catName.includes("shoe") || catName.includes("boot") || catName.includes("sneaker");
  const isFash = catName.includes("fashion") || catName.includes("cloth") || catName.includes("wear") || isShoes;
  const sizes = isShoes ? SIZES_SHOES : isFash ? SIZES_CLOTHES : [];


  const handleAddCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product._id, title: product.title, price, image: product.imageCover, color, size });
    }
  };


  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast("Please sign in to purchase", { icon: "🔒" });
      router.push("/login");
      return;
    }

    setBuyNowItem({ id: product._id, title: product.title, price, image: product.imageCover, qty, color, size });

    router.push("/checkout?mode=buynow");
  };

  return (
    <div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-primary-600 transition">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-primary-600 transition">Shop</Link>
          {product.category && (
            <>
              <FiChevronRight className="w-3 h-3" />
              <Link href={`/products?catId=${product.category._id}`} className="hover:text-primary-600 transition">
                {product.category.name}
              </Link>
            </>
          )}
          <FiChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium truncate max-w-xs">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

   
            <div>
              <div className="relative bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center mb-3"
                style={{ height: 420 }}>
                {hasDisc && (
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    -{discPct}%
                  </div>
                )}
                <Image src={mainImg || product.imageCover} alt={product.title}
                  fill className="object-contain p-4" unoptimized />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImgs.map((src, i) => (
                  <button key={i} onClick={() => setMainImg(src)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                      ${mainImg === src ? "border-primary-500 shadow-sm" : "border-gray-200 hover:border-primary-300"}`}>
                    <Image src={src} alt="" width={64} height={64}
                      className="w-full h-full object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </div>

         
            <div className="flex flex-col gap-4">

           
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-green-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category?.name}
                </span>
                {product.brand?.name && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    {product.brand.name}
                  </span>
                )}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border
                  ${(product.quantity ?? 0) > 0
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block
                    ${(product.quantity ?? 0) > 0 ? "bg-green-500" : "bg-red-500"}`} />
                  {(product.quantity ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

             
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>

             
              <div className="flex items-center gap-3 flex-wrap">
                <Stars rating={product.ratingsAverage ?? 0} />
                <span className="text-sm text-gray-500">
                  {(product.ratingsAverage ?? 0).toFixed(1)} ({product.ratingsQuantity ?? 0} reviews)
                </span>
                {!!product.sold && (
                  <span className="text-xs text-gray-400 border-l pl-3">{product.sold} sold</span>
                )}
              </div>

           
              <div className="flex items-baseline gap-3 py-3 border-t border-b border-gray-100">
                <span className="text-3xl font-extrabold text-gray-900">{price} EGP</span>
                {hasDisc && (
                  <>
                    <span className="text-lg text-gray-400 line-through">{product.price} EGP</span>
                    <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                      Save {discPct}%
                    </span>
                  </>
                )}
              </div>

             
              <p className="text-sm text-gray-600 leading-relaxed">
                {(product.description ?? "").slice(0, 150)}
                {(product.description?.length ?? 0) > 150 ? "…" : ""}
              </p>

              
              {isFash && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2.5">
                    Color: <span className="font-normal text-gray-500">{color}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COLORS_FASHION.map(c => (
                      <button key={c} onClick={() => setColor(c)}
                        style={{ background: c, border: c === "#ffffff" ? "1px solid #e5e7eb" : "none" }}
                        className={`w-7 h-7 rounded-full transition-all hover:scale-110
                          ${color === c ? "ring-2 ring-offset-2 ring-primary-500 scale-110" : ""}`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}

              
              {sizes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2.5">
                    Size: <span className="font-normal text-gray-500">{size || "Select a size"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSize(s)}
                        className={`px-3.5 py-1.5 text-sm font-medium border rounded-xl transition-all
                          ${size === s
                            ? "bg-primary-600 text-white border-primary-600"
                            : "border-gray-300 hover:border-primary-400 hover:text-primary-600"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

             
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2.5">Quantity:</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition select-none">
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900 border-x border-gray-200">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition select-none">
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  {!!product.quantity && (
                    <span className="text-xs text-gray-400">{product.quantity} available</span>
                  )}
                </div>
              </div>

             
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-gray-600">Total Price:</span>
                <span className="text-lg font-extrabold text-primary-600">{totalPrice} EGP</span>
              </div>

             
              <div className="flex gap-3 flex-col sm:flex-row">
                <button onClick={handleAddCart}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base">
                  <FiShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button onClick={handleBuyNow}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base">
                  ⚡ Buy Now
                  {!isLoggedIn && (
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md ml-1 font-normal">sign in</span>
                  )}
                </button>
              </div>

              
              <div className="flex gap-3">
                <button
                  onClick={() => toggle({ id: product._id, title: product.title, price, image: product.imageCover })}
                  className={`flex-1 border-2 rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-all
                    ${inWl
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-400"}`}>
                  <FiHeart className="w-4 h-4" fill={inWl ? "currentColor" : "none"} />
                  {inWl ? "Saved to Wishlist" : "Add to Wishlist"}
                </button>
                <button
                  onClick={() => navigator.share?.({ title: product.title, url: window.location.href }).catch(() => { })}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all">
                  <FiShare2 className="w-4 h-4" />
                </button>
              </div>

             
              <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-gray-100">
                {[
                  [FiTruck, "Free shipping over 500 EGP", "bg-green-50 border-green-200 text-green-700"],
                  [FiRefreshCw, "14-day returns", "bg-blue-50 border-blue-200 text-blue-700"],
                  [FiShield, "Secure checkout", "bg-yellow-50 border-yellow-200 text-yellow-700"],
                ].map(([Icon, text, cls]) => (
                  <span key={text as string} className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl ${cls as string}`}>
                    <Icon className="w-3 h-3" /> {text as string}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-10">
          <div className="flex border-b border-gray-200">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-semibold transition border-b-2
                  ${tab === t ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {tab === "Description" && (
              <p className="text-gray-600 leading-relaxed text-sm">{product.description ?? "No description."}</p>
            )}
            {tab === "Reviews" && (
              <div>
                <div className="flex items-center gap-8 mb-6 p-5 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-gray-900">{(product.ratingsAverage ?? 0).toFixed(1)}</p>
                    <Stars rating={product.ratingsAverage ?? 0} size="lg" />
                    <p className="text-xs text-gray-400 mt-1">Based on {product.ratingsQuantity ?? 0} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(n => (
                      <div key={n} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 text-right">{n}</span>
                        <span className="text-amber-400">★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-400 h-2 rounded-full"
                            style={{ width: `${n === 5 ? 60 : n === 4 ? 25 : n === 3 ? 10 : n === 2 ? 3 : 2}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-400 italic">Detailed reviews coming soon.</p>
              </div>
            )}
            {tab === "Shipping & Returns" && (
              <div className="space-y-4 text-sm text-gray-600">
                {[
                  ["🚚", "Standard Delivery", "2–5 business days. Free on orders over 500 EGP."],
                  ["⚡", "Express Delivery", "Same-day or next-day delivery in select areas."],
                  ["🔄", "Easy Returns", "Return within 14 days for a full refund."],
                ].map(([icon, title, desc]) => (
                  <div key={title as string} className="flex gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div><strong className="text-gray-900 block mb-1">{title as string}</strong>{desc as string}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
              <Link href={`/products?catId=${product.category?._id}`}
                className="text-sm font-semibold text-primary-600 hover:underline">View All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

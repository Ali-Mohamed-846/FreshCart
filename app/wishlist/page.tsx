"use client";

import Link from "next/link";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Breadcrumb } from "@/components/UI";
import toast from "@/lib/toast";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();

  const moveToCart = (item: typeof items[0]) => {
    addItem({ id: item.id, title: item.title, price: item.price, image: item.image });
    toggle(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <FiHeart className="w-7 h-7 text-red-500" fill="currentColor" />
          My Wishlist
          <span className="bg-red-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">{items.length}</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-8xl mb-5">💔</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-7">Save items you love to buy them later.</p>
          <Link href="/products" className="inline-block bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-700 transition">
            Explore Products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition group">
              <div className="relative">
                <button onClick={() => toggle(item)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:scale-110 transition">
                  <FiHeart className="w-4 h-4" fill="currentColor" />
                </button>
                <Link href={`/products/${item.id}`} className="block bg-gray-50 h-44 overflow-hidden">
                  <img src={item.image} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
              </div>
              <div className="p-3">
                <Link href={`/products/${item.id}`}>
                  <h3 className="text-sm font-semibold text-gray-800 hover:text-primary-600 mb-2 transition"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.title}
                  </h3>
                </Link>
                <p className="font-bold text-gray-900 text-sm mb-3">{item.price} EGP</p>
                <button onClick={() => moveToCart(item)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95">
                  <FiShoppingCart className="w-3 h-3" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

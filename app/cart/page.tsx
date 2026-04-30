"use client";

import { useState } from "react";
import Link from "next/link";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag, FiUser } from "react-icons/fi";
import { LockKeyhole, RefreshCcw, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "@/lib/toast";

const COUPONS: Record<string, number> = { FRESH20: 20, SAVE10: 10, ORGANIC40: 40 };
const FREE_SHIP = 500;

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart();
  const { isLoggedIn } = useAuth();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ── Confirm dialog state ──────────────────────────────────────
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const shipping = total >= FREE_SHIP ? 0 : 50;
  const discountAmt = Math.round(total * discount / 100);
  const grandTotal = total + shipping - discountAmt;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setDiscount(COUPONS[code]);
      setCouponMsg({ text: `✓ "${code}" applied — ${COUPONS[code]}% off!`, ok: true });
    } else {
      setDiscount(0);
      setCouponMsg({ text: "✗ Invalid code. Try FRESH20, SAVE10 or ORGANIC40.", ok: false });
    }
  };

  if (!count) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
        <FiShoppingBag className="w-7 h-7 text-primary-600" /> My Cart
      </h1>
      <div className="text-center py-24">
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-7">Browse our products and add some items!</p>
        <Link href="/products"
          className="inline-block bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-700 transition">
          Start Shopping →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">


      <ConfirmDialog
        open={!!confirmRemoveId}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart?"
        confirmLabel="Yes, Remove"
        danger
        onConfirm={() => {
          if (confirmRemoveId) {
            removeItem(confirmRemoveId);
            toast("Item removed", { icon: <Trash2 className="w-4 h-4 text-red-500" />, id: "cart-remove" });
          }
          setConfirmRemoveId(null);
        }}
        onCancel={() => setConfirmRemoveId(null)}
      />


      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear Cart?"
        message="Are you sure you want to remove all items from your cart? This cannot be undone."
        confirmLabel="Yes, Clear All"
        danger
        onConfirm={() => {
          clearCart();
          toast("Cart cleared", { icon: <Trash2 className="w-4 h-4 text-red-500" />, id: "cart-clear" });
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <h1 className="text-2xl font-extrabold text-gray-900 mb-7 flex items-center gap-2">
        <FiShoppingBag className="w-7 h-7 text-primary-600" />
        My Cart
        <span className="bg-primary-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">{count}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  {/* Image */}
                  <Link href={`/products/${item.id}`}
                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={item.image} alt={item.title}
                      className="w-full h-full object-cover hover:opacity-80 transition" />
                  </Link>


                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition block truncate mb-0.5">
                      {item.title}
                    </Link>
                    {item.color && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-1">{item.color}</span>}
                    {item.size && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.size}</span>}
                    <p className="text-primary-600 font-bold text-sm mt-1">{item.price} EGP</p>
                  </div>


                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold border-x border-gray-200">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 transition">
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>


                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-900">{(item.price * item.qty).toFixed(0)} <span className="text-xs font-normal text-gray-400">EGP</span></p>
                    </div>

                    <button onClick={() => setConfirmRemoveId(item.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>


            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
              <Link href="/products"
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline">
                ← Continue Shopping
              </Link>

              <button onClick={() => setConfirmClearOpen(true)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition">
                <FiTrash2 className="w-4 h-4" /> Clear all items
              </button>
            </div>
          </div>


          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiTag className="w-4 h-4 text-primary-600" /> Coupon Code
            </h3>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyCoupon()}
                placeholder="Enter coupon code…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 transition uppercase placeholder:normal-case" />
              <button onClick={applyCoupon}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mt-2 font-medium ${couponMsg.ok ? "text-primary-600" : "text-red-500"}`}>
                {couponMsg.text}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Try:{" "}
              {["FRESH20", "SAVE10", "ORGANIC40"].map(c => (
                <button key={c} onClick={() => setCoupon(c)}
                  className="font-mono bg-gray-100 px-1.5 py-0.5 rounded hover:bg-green-100 mr-1.5 transition">
                  {c}
                </button>
              ))}
            </p>
          </div>
        </div>


        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-20 h-fit">
          <div className="bg-gray-900 text-white px-6 py-4">
            <h3 className="font-bold text-base">Order Summary</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} item{count !== 1 ? "s" : ""})</span>
                <span className="font-semibold text-gray-900">{total.toFixed(0)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {isLoggedIn ? (
                  <span className={shipping === 0 ? "text-primary-600 font-semibold" : "font-medium text-gray-900"}>
                    {shipping === 0 ? "FREE" : `${shipping} EGP`}
                  </span>
                ) : (
                  <span className="text-primary-600 font-semibold text-xs">Calculated at checkout</span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount ({discount}%)</span>
                  <span className="font-semibold">−{discountAmt} EGP</span>
                </div>
              )}
            </div>


            {isLoggedIn && total < FREE_SHIP && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1.5">
                  Add <strong className="text-gray-900">{(FREE_SHIP - total).toFixed(0)} EGP</strong> more for FREE shipping!
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((total / FREE_SHIP) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 my-4" />

            <div className="flex justify-between font-extrabold text-gray-900 text-lg mb-5">
              <span>Estimated Total</span>
              <span className="text-primary-600">
                {isLoggedIn ? grandTotal.toFixed(0) : total.toFixed(0)} EGP
              </span>
            </div>

            {isLoggedIn ? (
              <Link href="/checkout"
                className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3.5 rounded-xl font-bold text-base transition active:scale-95 mb-3">
                Proceed to Checkout →
              </Link>
            ) : (
              <div>
                <Link href="/login"
                  className="flex w-full items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-base transition active:scale-95 mb-2">
                  <FiUser className="w-5 h-5" /> Login to Checkout
                </Link>
                <p className="text-center text-xs text-gray-500 mb-4">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary-600 font-semibold hover:underline">Sign up</Link>
                </p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p className="flex items-center gap-2"><span className="text-primary-600">✓</span> Your cart items will be saved</p>
                  <p className="flex items-center gap-2"><span className="text-primary-600">✓</span> Track your orders easily</p>
                  <p className="flex items-center gap-2"><span className="text-primary-600">✓</span> Access exclusive member deals</p>
                </div>
              </div>
            )}

            {isLoggedIn && (
              <div className="space-y-1.5 text-xs text-gray-400 text-center mt-3">
                <p className="inline-flex items-center justify-center gap-1.5">
                  <LockKeyhole className="w-3.5 h-3.5" />
                  <span>SSL Encrypted &amp; Secure</span>
                </p>
                <p className="inline-flex items-center justify-center gap-1.5">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Free 14-day returns</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

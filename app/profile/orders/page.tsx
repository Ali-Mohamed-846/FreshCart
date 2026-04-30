"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronRight, FiPackage, FiMapPin, FiClock } from "react-icons/fi";
import { Package, Phone, ShoppingCart } from "lucide-react";
import type { StoredOrder } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { readOrders } from "@/lib/orderStorage";
import { getUserStorageId } from "@/lib/userIdentity";

const STATUS_STYLE: Record<StoredOrder["status"], string> = {
  Processing: "bg-amber-100 text-amber-700 border border-amber-200",
  Shipped: "bg-blue-100 text-blue-700 border border-blue-200",
  Delivered: "bg-green-100 text-green-700 border border-green-200",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const uid = getUserStorageId(user);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setOrders(readOrders(uid));
  }, [uid]);

  return (
    <div>
     
      <div className="bg-gradient-to-r from-primary-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">My Orders</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FiPackage className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold">My Orders</h1>
                <p className="text-green-100 text-sm mt-1">Track and manage your {orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <ShoppingCart className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">When you place an order, it will appear here.</p>
            <Link href="/products" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isOpen = open === order.id;
              const date = new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-primary-200 transition">

                
                  <div className="p-5 flex items-center gap-4">
                  
                    <div className="flex -space-x-2 flex-shrink-0">
                      {order.items.slice(0, 2).map((item, i) => (
                        <img key={i} src={item.image} alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-gray-100 shadow-sm" />
                      ))}
                      {order.items.length > 2 && (
                        <div className="w-12 h-12 rounded-xl bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                          +{order.items.length - 2}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="text-lg font-extrabold text-gray-900">#{order.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {date}</span>
                        <span className="flex items-center gap-1"><FiPackage className="w-3 h-3" /> {order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                        {order.shipping.city && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" /> {order.shipping.city}</span>}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xl font-extrabold text-gray-900">{order.total.toFixed(0)} <span className="text-sm text-gray-400 font-normal">EGP</span></span>
                      <button onClick={() => setOpen(isOpen ? null : order.id)}
                        className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition flex items-center gap-1.5
                          ${isOpen ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600 hover:bg-primary-100"}`}>
                        {isOpen ? "Hide ▲" : "Details ▼"}
                      </button>
                    </div>
                  </div>

               
                  {isOpen && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                  
                      <div className="mb-5">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3">
                          <span className="w-6 h-6 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                            <FiPackage className="w-3.5 h-3.5" />
                          </span>
                          Order Items
                        </h3>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                              <Link href={`/products/${item.id}`}>
                                <img src={item.image} alt={item.title}
                                  className="w-14 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0 hover:opacity-80 transition" />
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.id}`}
                                  className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition block truncate">
                                  {item.title}
                                </Link>
                                <p className="text-xs text-gray-400 mt-0.5">{item.qty} × {item.price} EGP</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                                {(item.price * item.qty).toFixed(0)} EGP
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="flex items-center gap-2 font-bold text-gray-900 text-xs uppercase tracking-wide mb-3">
                            <FiMapPin className="w-3.5 h-3.5 text-primary-600" /> Delivery Address
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">{order.shipping.name}</p>
                          {order.shipping.address && <p className="text-gray-500 text-xs mt-0.5">{order.shipping.address}</p>}
                          <p className="text-gray-500 text-xs mt-0.5">{order.shipping.city}</p>
                          <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {order.shipping.phone}
                          </p>
                        </div>

                       
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="flex items-center gap-2 font-bold text-gray-900 text-xs uppercase tracking-wide mb-3">
                            <FiClock className="w-3.5 h-3.5 text-amber-600" /> Order Summary
                          </p>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal</span><span>{order.total} EGP</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Shipping</span><span className="text-primary-600 font-semibold">Free</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 border-t border-amber-200 pt-2 mt-2">
                              <span>Total</span><span>{order.total.toFixed(0)} EGP</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Link href="/products"
                          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
                          Reorder
                        </Link>
                        <button className="border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2 rounded-xl hover:bg-gray-50 transition">
                          Get Help
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

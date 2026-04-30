"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronRight, FiLayers } from "react-icons/fi";
import { Spinner } from "@/components/UI";
import { getCategories } from "@/lib/api";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCats).finally(() => setLoading(false));
  }, []);

  return (
    <div>

      <div className="bg-gradient-to-r from-primary-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Categories</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiLayers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">All Categories</h1>
              <p className="text-green-100 text-sm mt-1">Browse our wide range of product categories</p>
            </div>
          </div>
        </div>
      </div>

     
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <Spinner className="py-20" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {cats.map((cat) => (
              <Link key={cat._id}
                href={`/products?catId=${cat._id}&catName=${encodeURIComponent(cat.name)}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-200">
                <div className="w-full aspect-square overflow-hidden bg-gray-50 relative">
                  <Image src={cat.image} alt={cat.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                
                
                  <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-all duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-primary-600 font-semibold text-xs bg-white/90 px-3 py-1 rounded-full transition-all duration-200">
                      Shop Now →
                    </span>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition text-sm">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

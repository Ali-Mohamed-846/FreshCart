"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiSearch, FiChevronRight, FiTag } from "react-icons/fi";
import { Spinner } from "@/components/UI";
import { getBrands } from "@/lib/api";
import type { Brand } from "@/types";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filtered, setFiltered] = useState<Brand[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands().then(b => { setBrands(b); setFiltered(b); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(query ? brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase())) : brands);
  }, [query, brands]);

  return (
    <div>

      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-sm text-purple-200 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Brands</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiTag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Top Brands</h1>
              <p className="text-purple-200 text-sm mt-1">Shop from your favorite brands</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
  
        <div className="max-w-md mb-8">
          <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-purple-400 transition">
            <FiSearch className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search brands…"
              className="flex-1 px-3 py-3 text-sm outline-none" />
          </div>
        </div>

        {loading ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-gray-500">No brands found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((brand) => (
              <Link key={brand._id}
                href={`/products?brandId=${brand._id}&brandName=${encodeURIComponent(brand.name)}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center gap-3
                  hover:border-purple-300 hover:shadow-md transition-all duration-200 aspect-square shadow-sm">
                <div className="w-20 h-20 flex items-center justify-center">
                  <Image src={brand.image} alt={brand.name} width={80} height={80}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    unoptimized />
                </div>
                <p className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition text-center leading-tight">
                  {brand.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

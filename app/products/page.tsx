"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiGrid, FiList, FiFilter, FiX, FiChevronRight } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import { Spinner } from "@/components/UI";
import { getProducts, getCategories } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "-ratingsAverage", label: "Top Rated" },
  { value: "-createdAt", label: "Newest" },
];

const PER_PAGE = 20;

function ProductsInner() {
  const sp = useSearchParams();
  const urlCatId = sp.get("catId") ?? "";
  const urlCatName = sp.get("catName") ?? "";
  const urlBrandId = sp.get("brandId") ?? "";
  const urlBrandNm = sp.get("brandName") ?? "";
  const searchQ = sp.get("search") ?? "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);


  const [activeCat, setActiveCat] = useState(urlCatId);
  const [activeCatNm, setActiveCatNm] = useState(urlCatName); // ← tracks name for title
  const [activeBrand, setActiveBrand] = useState(urlBrandId);
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    setLoading(true);
    getProducts({ limit: 500 })
      .then((r) => setAllProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { getCategories().then(setCategories); }, []);


  useEffect(() => {
    setActiveCat(urlCatId);
    setActiveCatNm(urlCatName);
    setActiveBrand(urlBrandId);
  }, [urlCatId, urlCatName, urlBrandId]);


  useEffect(() => { setPage(1); }, [activeCat, activeBrand, searchQ, minPrice, maxPrice, minRating, sort]);


  const filteredList = useCallback((): Product[] => {
    let list = [...allProducts];
    if (activeCat) list = list.filter((p) => p.category?._id === activeCat);
    if (activeBrand) list = list.filter((p) => p.brand?._id === activeBrand);
    if (searchQ) list = list.filter((p) => p.title.toLowerCase().includes(searchQ.toLowerCase()));
    if (minPrice) list = list.filter((p) => (p.priceAfterDiscount ?? p.price) >= +minPrice);
    if (maxPrice) list = list.filter((p) => (p.priceAfterDiscount ?? p.price) <= +maxPrice);
    if (minRating) list = list.filter((p) => (p.ratingsAverage ?? 0) >= minRating);
    if (sort === "price") list.sort((a, b) => (a.priceAfterDiscount ?? a.price) - (b.priceAfterDiscount ?? b.price));
    else if (sort === "-price") list.sort((a, b) => (b.priceAfterDiscount ?? b.price) - (a.priceAfterDiscount ?? a.price));
    else if (sort === "-ratingsAverage") list.sort((a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0));
    return list;
  }, [allProducts, activeCat, activeBrand, searchQ, minPrice, maxPrice, minRating, sort]);

  const items = filteredList();
  const totalPages = Math.ceil(items.length / PER_PAGE);
  const pageItems = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);


  const pageTitle = activeCatNm || urlBrandNm || (searchQ ? `"${searchQ}"` : "All Products");
  const pageSubtitle =
    activeCatNm ? "Browse our wide range of product categories" :
      urlBrandNm ? `Shop all ${urlBrandNm} products` :
        searchQ ? `Search results for "${searchQ}"` :
          "Explore our complete product collection";

  const clearFilters = () => {
    setActiveCat(""); setActiveCatNm(""); setActiveBrand("");
    setSort(""); setMinPrice(""); setMaxPrice(""); setMinRating(0);
  };


  function SidebarFilters() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Filters</h3>
          <Button
            type="button"
            onClick={clearFilters}
            variant="link"
            className="text-xs text-primary-600 hover:underline font-medium p-0 h-auto"
          >
            Clear All
          </Button>
        </div>


        <div>
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Category</h4>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-primary-600 py-0.5">
              <input type="radio" name="catF" checked={activeCat === ""}
                onChange={() => { setActiveCat(""); setActiveCatNm(""); setActiveBrand(""); }}
                className="accent-primary-600 w-3.5 h-3.5 flex-shrink-0" />
              All Categories
            </label>
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-primary-600 py-0.5">
                <input type="radio" name="catF" checked={activeCat === cat._id}
                  onChange={() => {
                    setActiveCat(cat._id);
                    setActiveCatNm(cat.name);   /* ← update title */
                    setActiveBrand("");
                  }}
                  className="accent-primary-600 w-3.5 h-3.5 flex-shrink-0" />
                {cat.name}
              </label>
            ))}
          </div>
        </div>


        <div>
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Price Range (EGP)</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-primary-500 transition h-9"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-primary-500 transition h-9"
            />
          </div>
        </div>


        <div>
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Min Rating</h4>
          <div className="space-y-2">
            {([0, 3, 4] as const).map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-primary-600">
                <input type="radio" name="ratingF" checked={minRating === r} onChange={() => setMinRating(r)}
                  className="accent-primary-600 w-3.5 h-3.5 flex-shrink-0" />
                {r === 0 ? "All Ratings" : <span className="text-amber-400">{"★".repeat(r)}{"☆".repeat(5 - r)} <span className="text-gray-500 text-xs">& up</span></span>}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>

      <div className="bg-gradient-to-r from-primary-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
              📦
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{pageTitle}</h1>
              <p className="text-green-100 text-sm mt-1">{pageSubtitle}</p>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-5">
          Showing {loading ? "…" : items.length} products
        </p>

        <div className="flex gap-6">

          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
              <SidebarFilters />
            </div>
          </aside>


          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="relative bg-white w-72 h-full overflow-y-auto p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Filters</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <FiX className="w-5 h-5" />
                  </Button>
                </div>
                <SidebarFilters />
              </div>
            </div>
          )}


          <div className="flex-1 min-w-0">

            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3.5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-500">{loading ? "Loading…" : `${items.length} products found`}</p>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <Button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  variant="outline"
                  className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition h-10"
                >
                  <FiFilter className="w-4 h-4" /> Filters
                </Button>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  {(["grid", "list"] as const).map((v) => (
                    <Button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      variant="ghost"
                      className={`px-3 py-2 transition rounded-none h-10 ${view === v ? "bg-primary-600 text-white hover:bg-primary-600" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                      {v === "grid" ? <FiGrid className="w-4 h-4" /> : <FiList className="w-4 h-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            </div>


            {loading ? (
              <Spinner className="py-24" />
            ) : items.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-6xl mb-4">🔍</p>
                <p className="font-bold text-gray-700 text-lg mb-2">No products found</p>
                <Button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition h-auto"
                >
                  Clear Filters
                </Button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {pageItems.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {pageItems.map((p) => {
                  const disc = !!p.priceAfterDiscount && p.priceAfterDiscount < p.price;
                  const price = disc ? p.priceAfterDiscount! : p.price;
                  const pct = disc ? Math.round((1 - p.priceAfterDiscount! / p.price) * 100) : 0;
                  return (
                    <div key={p._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
                      <Link href={`/products/${p._id}`} className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <img src={p.imageCover} alt={p.title} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary-600 font-semibold mb-0.5 uppercase">{p.category?.name}</p>
                        <Link href={`/products/${p._id}`} className="font-semibold text-gray-900 hover:text-primary-600 block truncate transition">{p.title}</Link>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                        {disc && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-{pct}%</span>}
                        <span className="font-bold text-gray-900">{price} EGP</span>
                        {disc && <span className="text-xs text-gray-400 line-through">{p.price} EGP</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}


            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                <Button
                  type="button"
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); scrollTo(0, 0); }}
                  variant="outline"
                  className="w-9 h-9 rounded-xl border border-gray-200 text-sm flex items-center justify-center disabled:opacity-30 hover:border-primary-500 hover:text-primary-600 transition p-0"
                >
                  ‹
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .reduce<(number | "…")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(n); return acc;
                  }, [])
                  .map((item, i) => item === "…" ? (
                    <span key={`el-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <Button
                      key={item}
                      type="button"
                      onClick={() => { setPage(item as number); scrollTo(0, 0); }}
                      variant="outline"
                      className={`w-9 h-9 rounded-xl text-sm font-medium border transition p-0
                        ${item === page ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-600" : "border-gray-200 hover:border-primary-500 hover:text-primary-600"}`}
                    >
                      {item}
                    </Button>
                  ))
                }
                <Button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); scrollTo(0, 0); }}
                  variant="outline"
                  className="w-9 h-9 rounded-xl border border-gray-200 text-sm flex items-center justify-center disabled:opacity-30 hover:border-primary-500 hover:text-primary-600 transition p-0"
                >
                  ›
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spinner className="py-32" />}>
      <ProductsInner />
    </Suspense>
  );
}

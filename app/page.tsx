"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { SiGoogleplay } from "react-icons/si";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple, Flame, Headset, Leaf, Mail, ShieldCheck, RefreshCcw, Sparkles, Smartphone, Tag, Truck } from "lucide-react";
import { getProducts, getCategories } from "@/lib/api";
import { Spinner } from "@/components/UI";
import type { Product, Category } from "@/types";



const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80",
    title: "Fresh Products Delivered",
    titleLine2: "to your Door",
    sub: "Get 20% off your first order",
    cta: "Shop Now",
    ctaHref: "/products",
    secondary: "View Deals",
    secondaryHref: "/products",
  },
  {
    img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80",
    title: "Premium Quality",
    titleLine2: "Guaranteed",
    sub: "Fresh from farm to your table",
    cta: "Shop Now",
    ctaHref: "/products",
    secondary: "Learn More",
    secondaryHref: "/contact",
  },
  {
    img: "https://images.unsplash.com/photo-1768393775846-6d0bd756a847?auto=format&fit=crop&w=1920&q=80",
    title: "Fast & Free",
    titleLine2: "Delivery",
    sub: "Same day delivery available",
    cta: "Order Now",
    ctaHref: "/products",
    secondary: "Delivery Info",
    secondaryHref: "/contact",
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(300px, 45vw, 520px)" }}>

      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.img}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.45) saturate(1.2)" }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 via-primary-800/30 to-transparent" />
        </div>
      ))}


      <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-xl text-white">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3 drop-shadow-md">
            {slide.title}
            <br />
            {slide.titleLine2}
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-7">{slide.sub}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-white text-primary-700 font-bold px-7 py-3 rounded-xl hover:bg-green-50 transition shadow-md text-sm md:text-base h-auto"
            >
              <Link href={slide.ctaHref}>{slide.cta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-white/70 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition text-sm md:text-base h-auto bg-transparent"
            >
              <Link href={slide.secondaryHref}>{slide.secondary}</Link>
            </Button>
          </div>
        </div>
      </div>


      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <Button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={i === current ? "bg-white w-6 h-2.5" : "bg-white/40 w-2.5 h-2.5"}
            variant="ghost"
            size="icon"
          />
        ))}
      </div>


      <Button
        type="button"
        onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold transition"
        variant="ghost"
        size="icon"
      >
        ‹
      </Button>
      <Button
        type="button"
        onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold transition"
        variant="ghost"
        size="icon"
      >
        ›
      </Button>
    </section>
  );
}


function FeaturesBar() {
  const feats: Array<{ Icon: React.ComponentType<{ className?: string }>; title: string; sub: string }> = [
    { Icon: Truck, title: "Free Shipping", sub: "On orders over 500 EGP" },
    { Icon: ShieldCheck, title: "Secure Payment", sub: "100% secure transactions" },
    { Icon: RefreshCcw, title: "Easy Returns", sub: "14-day return policy" },
    { Icon: Headset, title: "24/7 Support", sub: "Dedicated support team" },
  ];
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {feats.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 py-5 px-6">
              <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function CategoriesSection() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCats).finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary-600 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">
            Shop By <span className="text-primary-600">Category</span>
          </h2>
        </div>
        <Link href="/categories" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
          View All <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? <Spinner className="py-12" /> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {cats.map((cat) => (
            <Link key={cat._id}
              href={`/products?catId=${cat._id}&catName=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center border border-gray-200 rounded-2xl p-3 hover:border-primary-400 hover:bg-green-50 transition-all">
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
                <Image src={cat.image} alt={cat.name} width={120} height={120}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              </div>
              <p className="text-xs font-semibold text-center text-gray-700 group-hover:text-primary-600 leading-tight">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}


function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


        <div className="relative rounded-2xl overflow-hidden p-7 flex flex-col justify-between"
          style={{ background: "linear-gradient(135deg,#fff3e0,#ffe0b2)", minHeight: 190 }}>

          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle,#fb923c,transparent)" }} />

          <div>
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Flame className="w-3.5 h-3.5" />
              Deal of the Day
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Fresh Organic Fruits</h3>
            <p className="text-gray-500 text-sm mb-4">Get up to 40% off on selected items</p>
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-orange-500 text-white text-sm font-extrabold px-3 py-1 rounded-full">40% OFF</span>
              <span className="text-xs text-gray-500">Code: <strong className="text-gray-700">ORGANIC40</strong></span>
            </div>
          </div>
          <Link href="/products"
            className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all w-fit">
            Shop Now →
          </Link>


          <span className="absolute bottom-4 right-6 select-none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.10))" }}>
            <Apple className="w-20 h-20 text-orange-500/90" />
          </span>
        </div>


        <div className="relative rounded-2xl overflow-hidden p-7 flex flex-col justify-between"
          style={{ background: "linear-gradient(135deg,#f0fdf4,#d1fae5)", minHeight: 190 }}>

          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle,#16a34a,transparent)" }} />

          <div>
            <span className="inline-flex items-center gap-1 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              ✦ New Arrivals
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Exotic Vegetables</h3>
            <p className="text-gray-500 text-sm mb-4">Discover our latest collection</p>
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-primary-600 text-white text-sm font-extrabold px-3 py-1 rounded-full">25% OFF</span>
              <span className="text-xs text-gray-500">Code: <strong className="text-gray-700">FRESH25</strong></span>
            </div>
          </div>
          <Link href="/products"
            className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all w-fit">
            Explore Now →
          </Link>


          <span className="absolute bottom-4 right-6 select-none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.10))" }}>
            <Leaf className="w-20 h-20 text-primary-700/80" />
          </span>
        </div>

      </div>
    </section>
  );
}


function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 10 }).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary-600 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">
            Featured <span className="text-primary-600">Products</span>
          </h2>
        </div>
        <Link href="/products" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
          View All <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? <Spinner className="py-20" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </section>
  );
}


function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="border border-gray-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">


        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-10">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">NEWSLETTER</p>
              <p className="text-sm font-semibold text-gray-600">50,000+ subscribers</p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            Get the Freshest Updates{" "}
            <span className="text-primary-600">Delivered Free</span>
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Weekly recipes, seasonal offers &amp; exclusive member perks.
          </p>


          <div className="flex flex-wrap gap-3 mb-6">
            {([
              [Leaf, "Fresh Picks Weekly"],
              [Truck, "Free Delivery Codes"],
              [Tag, "Members-Only Deals"],
            ] as const).map(([Icon, label]) => (
              <span key={label} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full font-medium shadow-sm">
                <Icon className="w-4 h-4 text-primary-600" />
                {label}
              </span>
            ))}
          </div>

          {done ? (
            <p className="text-primary-600 font-bold text-lg">🎉 Thanks for subscribing!</p>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
              className="flex gap-3"
            >
              <Input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition bg-white"
              />
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 whitespace-nowrap h-auto"
              >
                Subscribe →
              </Button>
            </form>
          )}
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Unsubscribe anytime. No spam, ever.
          </p>
        </div>


        <div className="bg-gray-900 p-8 md:p-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 text-primary-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 w-fit">
            <Smartphone className="w-4 h-4" />
            MOBILE APP
          </div>

          <h3 className="text-2xl font-extrabold text-white mb-2">Shop Faster on Our App</h3>
          <p className="text-gray-400 text-sm mb-7">
            Get app-exclusive deals &amp; 15% off your first order.
          </p>

          <div className="space-y-3 mb-6">

            <a href="#"
              className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition group">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">DOWNLOAD ON</p>
                <p className="text-white font-bold text-base leading-tight">App Store</p>
              </div>
            </a>


            <a href="#"
              className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition group">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <SiGoogleplay className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">GET IT ON</p>
                <p className="text-white font-bold text-base leading-tight">Google Play</p>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex text-amber-400 text-sm">{"★".repeat(5)}</div>
            <span className="text-gray-400 text-sm font-medium">4.9 · 100K+ downloads</span>
          </div>
        </div>

      </div>
    </section>
  );
}


export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturesBar />
      <CategoriesSection />
      <PromoBanners />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
}

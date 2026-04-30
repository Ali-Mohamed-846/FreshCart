"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHome, FiArrowLeft, FiShoppingCart } from "react-icons/fi";

function GoBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-bold px-6 py-3 rounded-xl border border-gray-200 transition-all text-sm">
      <FiArrowLeft className="w-4 h-4" /> Go Back
    </button>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

    
      <div className="relative mb-3">
        <div className="w-36 h-36 bg-white rounded-3xl shadow-sm flex items-center justify-center">
          <FiShoppingCart className="w-16 h-16 text-primary-400" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-3 -right-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-lg">
          404
        </div>
      </div>

    
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-2 h-2 rounded-full bg-gray-300" />
        <span className="w-6 h-2 rounded-full bg-gray-300" />
        <span className="w-2 h-2 rounded-full bg-gray-300" />
      </div>

   
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3 text-center">
        Oops! Nothing Here
      </h1>
      <p className="text-gray-500 text-center max-w-xs mb-8 leading-relaxed text-sm">
        Looks like this page went out of stock! Don&apos;t worry,
        there&apos;s plenty more fresh content to explore.
      </p>

      
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <Link href="/"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm">
          <FiHome className="w-4 h-4" /> Go to Homepage
        </Link>
        <GoBackButton />
      </div>

     
      <div className="bg-white border border-gray-200 rounded-2xl px-8 py-5 text-center max-w-sm w-full">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Popular Destinations
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "All Products",  href: "/products",  green: true  },
            { label: "Categories",    href: "/categories", green: false },
            { label: "Today's Deals", href: "/products",  green: false },
            { label: "Contact Us",    href: "/contact",   green: false },
          ].map(({ label, href, green }) => (
            <Link key={label} href={href}
              className={`font-medium text-xs px-4 py-2 rounded-xl border transition
                ${green
                  ? "bg-primary-600 text-white border-primary-600 hover:bg-primary-700"
                  : "border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600 hover:bg-green-50"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-xs">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "text-amber-400" : "text-gray-300"}>★</span>
      ))}
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();

  const hasDisc = !!product.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const price = hasDisc ? product.priceAfterDiscount! : product.price;
  const discPct = hasDisc ? Math.round((1 - product.priceAfterDiscount! / product.price) * 100) : 0;
  const inWl = isInWishlist(product._id);

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-200">
   
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "1" }}>
        <Link href={`/products/${product._id}`}>
          <Image
            src={product.imageCover}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </Link>

       
        {hasDisc && (
          <Badge variant="destructive" className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5">
            -{discPct}%
          </Badge>
        )}

      
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="icon"
            variant="outline"
            className={`h-8 w-8 rounded-xl shadow-sm ${inWl ? "text-red-500 border-red-300 bg-red-50" : ""}`}
            onClick={() => toggle({ id: product._id, title: product.title, price, image: product.imageCover })}
          >
            <FiHeart className={`w-3.5 h-3.5 ${inWl ? "fill-current" : ""}`} />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl shadow-sm" asChild>
            <Link href={`/products/${product._id}`}>
              <FiEye className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      
      <div className="p-3">
        <p className="text-[10px] text-primary-600 font-semibold uppercase tracking-wide mb-0.5">
          {product.category?.name}
        </p>
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition line-clamp-2 leading-snug mb-1.5">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.ratingsAverage ?? 0} />
          <span className="text-[10px] text-gray-400">({product.ratingsQuantity ?? 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold text-gray-900 text-sm">{price} EGP</span>
            {hasDisc && (
              <span className="text-xs text-gray-400 line-through ml-1.5">{product.price}</span>
            )}
          </div>
          <Button
            size="sm"
            className="h-8 px-3 text-xs rounded-xl"
            onClick={() => addItem({ id: product._id, title: product.title, price, image: product.imageCover })}
          >
            <FiShoppingCart className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

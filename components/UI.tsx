"use client";

import { ThreeDots } from "react-loader-spinner";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SpinnerProps { className?: string; size?: number; color?: string }

export function Spinner({ className = "", size = 40, color = "#16a34a" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ThreeDots height={size} width={size * 2} radius={9} color={color} ariaLabel="loading" visible />
    </div>
  );
}

interface Crumb { label: string; href?: string }

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {c.href ? (
            <Link href={c.href} className="hover:text-primary-600 transition">{c.label}</Link>
          ) : (
            <span className="text-gray-800 font-medium truncate max-w-xs">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}


export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <Skeleton className="aspect-square rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

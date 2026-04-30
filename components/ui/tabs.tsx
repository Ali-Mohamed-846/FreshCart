"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void }>({ value: "", onValueChange: () => {} })

function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return <TabsContext.Provider value={{ value, onValueChange }}><div className={className}>{children}</div></TabsContext.Provider>
}

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex border-b border-gray-200", className)}>{children}</div>
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn("px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px",
        active ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-800",
        className
      )}
    >{children}</button>
  )
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div className={cn("pt-4", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

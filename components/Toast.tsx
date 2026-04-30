"use client";

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";


interface ToastItem {
  id: number;
  msg: string;
  type: "success" | "error" | "default";
  icon?: ReactNode;
}

interface ToastCtx {
  show: (msg: string, type?: "success" | "error" | "default", icon?: ReactNode) => void;
}


const ToastContext = createContext<ToastCtx | null>(null);
let _show: ToastCtx["show"] = () => { };


export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((msg: string, type: "success" | "error" | "default" = "default", icon?: ReactNode) => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-2), { id, msg, type, icon }]); 
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);


  _show = show;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

    
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastBubble key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}


function ToastBubble({ toast: t }: { toast: ToastItem }) {
  const [visible, setVisible] = useState(false);

 
  useEffect(() => {
    const in_ = setTimeout(() => setVisible(true), 10);
 
    const out = setTimeout(() => setVisible(false), 1200);
    return () => { clearTimeout(in_); clearTimeout(out); };
  }, []);

  const border =
    t.type === "success" ? "border-l-[3px] border-l-green-500" :
      t.type === "error" ? "border-l-[3px] border-l-red-500" :
        "border-l-[3px] border-l-gray-400";

  const icon =
    t.icon ? t.icon :
      t.type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
        t.type === "error" ? <XCircle className="w-4 h-4 text-red-500" /> :
          <Info className="w-4 h-4 text-blue-500" />;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: "auto",
      }}
      className={`flex items-center gap-2.5 bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 border border-gray-100 ${border} min-w-[160px] max-w-[280px]`}
    >
      <span className="leading-none flex-shrink-0">{icon}</span>
      <span>{t.msg}</span>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}


export function showToast(msg: string, type: "success" | "error" | "default" = "default", icon?: ReactNode) {
  _show(msg, type, icon);
}

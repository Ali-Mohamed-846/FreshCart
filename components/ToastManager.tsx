"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";


export type ToastType = "success" | "error" | "default";

interface ToastItem {
  id: number;
  msg: string;
  type: ToastType;
  icon?: string;
  visible: boolean;
}


type Listener = (msg: string, type: ToastType, icon?: string) => void;
let _listener: Listener | null = null;

export function fireToast(msg: string, type: ToastType = "default", icon?: string) {
  _listener?.(msg, type, icon);
}


export default function ToastManager() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = { n: 0 };

  const add = useCallback((msg: string, type: ToastType, icon?: string) => {
    const id = Date.now() + Math.random();

 
    setToasts(prev => [...prev.slice(-2), { id, msg, type, icon, visible: false }]);

  
    requestAnimationFrame(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t));
    });

   
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 320);
    }, 1500);
  }, []);

  useEffect(() => { _listener = add; return () => { _listener = null; }; }, [add]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#ffffff",
          color: "#111827",
          border: `1px solid #e5e7eb`,
          borderLeft: `3px solid ${t.type === "success" ? "#16a34a" : t.type === "error" ? "#ef4444" : "#9ca3af"}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
          cursor: "default",
          
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateX(0)" : "translateX(40px)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
        }}>
   
          {t.type === "success" && !t.icon && (
            <span style={{ color: "#16a34a", fontSize: 15, flexShrink: 0 }}>✓</span>
          )}
          {t.type === "error" && !t.icon && (
            <span style={{ color: "#ef4444", fontSize: 15, flexShrink: 0 }}>✗</span>
          )}
          {t.icon && (
            <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
          )}
          {t.msg}
        </div>
      ))}
    </div>,
    document.body
  );
}

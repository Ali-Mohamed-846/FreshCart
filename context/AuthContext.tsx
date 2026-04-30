"use client";

import {
  createContext, useContext, useEffect,
  useState, useCallback, ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types";
import { getUserStorageId } from "@/lib/userIdentity";
import { verifyToken } from "@/lib/api";


type SwitchFn = (uid: string) => void;

const _registry: {
  cartOnLogin?:    SwitchFn;
  cartOnLogout?:   SwitchFn;
  wlOnLogin?:      SwitchFn;
  wlOnLogout?:     SwitchFn;
} = {};

export function _registerCartSwitch(onLogin: SwitchFn, onLogout: SwitchFn) {
  _registry.cartOnLogin  = onLogin;
  _registry.cartOnLogout = onLogout;
}

export function _registerWLSwitch(onLogin: SwitchFn, onLogout: SwitchFn) {
  _registry.wlOnLogin  = onLogin;
  _registry.wlOnLogout = onLogout;
}


interface AuthContextType {
  user:       AuthUser | null;
  token:      string | null;
  login:      (user: AuthUser, token: string) => void;
  logout:     () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user,  setUser]  = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    try {
      const u = localStorage.getItem("fc_user");
      const t = localStorage.getItem("fc_token");
      if (u && t) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        setToken(t);
        verifyToken(t).catch(() => {
          localStorage.removeItem("fc_user");
          localStorage.removeItem("fc_token");
          setUser(null);
          setToken(null);
        });
      }
    } catch {}
  }, []);


  const login = useCallback((u: AuthUser, t: string) => {
    const normalized = { ...u, _id: getUserStorageId(u) };
    setUser(normalized);
    setToken(t);
    localStorage.setItem("fc_user",  JSON.stringify(normalized));
    localStorage.setItem("fc_token", t);


    const uid = getUserStorageId(normalized);
    _registry.cartOnLogin?.(uid);
    _registry.wlOnLogin?.(uid);
  }, []);


  const logout = useCallback(() => {
    const uid = getUserStorageId(user);


    _registry.cartOnLogout?.(uid);
    _registry.wlOnLogout?.(uid);

    localStorage.removeItem("fc_user");
    localStorage.removeItem("fc_token");

    setUser(null);
    setToken(null);

    router.push("/");
  }, [user, router]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

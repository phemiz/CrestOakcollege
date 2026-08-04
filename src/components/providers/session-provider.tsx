"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  matricNo?: string;
  staffId?: string;
  staffNo?: string;
  sin?: string;
  level?: number;
  department?: string;
}

export interface SessionData {
  user: AuthUser | null;
}

export interface AuthContextType {
  data: SessionData | null;
  status: "loading" | "authenticated" | "unauthenticated";
  updateSession: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: "loading",
  updateSession: async () => {},
  logout: () => {}
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const updateSession = useCallback(async () => {
    try {
      // First check client-side cookie
      const sessionCookie = getCookie("cchsmt_user_session") || getCookie("user");
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(sessionCookie));
          if (parsed && (parsed.id || parsed.email || parsed.role)) {
            setUser(parsed);
            setStatus("authenticated");
            return;
          }
        } catch {
          // Fall back to API fetch below
        }
      }

      // Check session.php endpoint
      const res = await fetch("/api/session.php", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          setUser(json.user);
          setStatus("authenticated");
          return;
        }
      }

      setUser(null);
      setStatus("unauthenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    updateSession();
  }, [updateSession]);

  const logout = useCallback(() => {
    document.cookie = "cchsmt_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    setStatus("unauthenticated");
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        data: user ? { user } : null,
        status,
        updateSession,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(AuthContext);
  return {
    data: ctx.data,
    status: ctx.status,
    update: ctx.updateSession
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return {
    user: ctx.data?.user || null,
    status: ctx.status,
    logout: ctx.logout,
    updateSession: ctx.updateSession
  };
}

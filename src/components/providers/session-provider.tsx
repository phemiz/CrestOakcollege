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

function clearLocalAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");
  localStorage.removeItem("cchsmt_user_session");
  localStorage.removeItem("csrfToken");
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const updateSession = useCallback(async () => {
    try {
      // 1. Initial local state check for instant UI response
      let localUser: AuthUser | null = null;
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("cchsmt_user_session");
        const isAuth = localStorage.getItem("isAuthenticated") === "true";
        if (storedUser && isAuth) {
          try {
            localUser = JSON.parse(storedUser);
            if (localUser && (localUser.id || localUser.email || localUser.role)) {
              setUser(localUser);
              setStatus("authenticated");
            }
          } catch {}
        }
      }

      // 2. Authoritative server session verification
      const res = await fetch("/api/session.php", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          const authUser: AuthUser = {
            id: String(json.user.user_id || json.user.id || ""),
            name: json.user.name || "User",
            email: json.user.email || "",
            role: json.user.role || "STUDENT"
          };
          setUser(authUser);
          setStatus("authenticated");

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(authUser));
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userRole", authUser.role);
            if (json.user.csrf) {
              localStorage.setItem("csrfToken", json.user.csrf);
            }
          }
          return;
        }

        // Server responded and explicitly said we're not authenticated —
        // trust it over any stale local state, and clear that stale state.
        clearLocalAuth();
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      // Server responded with a non-OK status (not a network failure) — treat as unauthenticated.
      clearLocalAuth();
      setUser(null);
      setStatus("unauthenticated");
    } catch (err) {
      console.warn("Session check error:", err);
      // Network/request failure (e.g. offline) — keep existing local user state rather than logging out.
    }
  }, []);

  useEffect(() => {
    updateSession();
  }, [updateSession]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout.php", {
        method: "POST",
        credentials: "include"
      });
    } catch {}

    clearLocalAuth();
    if (typeof window !== "undefined") {
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("crestoak_session");
      localStorage.removeItem("sessionToken");
    }

    document.cookie = "cchsmt_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "cchsmt_csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/session-provider";

export interface UseRequireAuthOptions {
  allowedRoles?: string[];
  gateway?: string;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { allowedRoles, gateway = "admin" } = options;
  const { user, status } = useAuth();
  const router = useRouter();

  const isChecking = status === "loading";

  // Check role authorization if allowedRoles specified
  let isRoleAuthorized = true;
  if (user && allowedRoles && allowedRoles.length > 0) {
    const userRoleUpper = (user.role || "").toUpperCase();
    const isAdminOrSuper = userRoleUpper.includes("ADMIN") || userRoleUpper.includes("SUPER");
    
    if (!isAdminOrSuper) {
      isRoleAuthorized = allowedRoles.some(
        (role) => role.toUpperCase() === userRoleUpper
      );
    }
  }

  const isAuthorized = status === "authenticated" && isRoleAuthorized;

  useEffect(() => {
    if (isChecking) return;

    if (!isAuthorized) {
      const loginUrl = gateway ? `/login/?gateway=${gateway}` : "/login/";
      router.replace(loginUrl);
    }
  }, [isChecking, isAuthorized, gateway, router]);

  return {
    user,
    isAuthorized,
    isChecking,
  };
}

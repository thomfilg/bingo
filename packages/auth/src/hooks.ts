"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { detectAppleDevice, type DeviceInfo } from "./device-detection";
import type { ExtendedSession } from "./index";

/**
 * Hook to get the current session with extended user info
 */
export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    session: session as ExtendedSession | null,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUnauthenticated: status === "unauthenticated",
    user: session?.user,
    update,
  };
}

/**
 * Hook for device detection with proper client-side hydration
 */
export function useDeviceDetection(): DeviceInfo & { isHydrated: boolean } {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isAppleDevice: false,
    isIOS: false,
    isMac: false,
    isSafari: false,
    userAgent: "",
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Run detection after component mounts to avoid hydration mismatch
    const info = detectAppleDevice();
    setDeviceInfo(info);
    setIsHydrated(true);
  }, []);

  return { ...deviceInfo, isHydrated };
}

/**
 * Provider types for social login
 */
export type SocialProvider = "google" | "facebook" | "apple";

/**
 * Hook for handling social login actions
 */
export function useSocialLogin() {
  const [isLoading, setIsLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (provider: SocialProvider, callbackUrl = "/") => {
    try {
      setIsLoading(provider);
      setError(null);

      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setIsLoading(null);
    }
  }, []);

  const loginWithGoogle = useCallback((callbackUrl?: string) => {
    return login("google", callbackUrl);
  }, [login]);

  const loginWithFacebook = useCallback((callbackUrl?: string) => {
    return login("facebook", callbackUrl);
  }, [login]);

  const loginWithApple = useCallback((callbackUrl?: string) => {
    return login("apple", callbackUrl);
  }, [login]);

  const logout = useCallback(async (callbackUrl = "/") => {
    try {
      setIsLoading(null);
      await signOut({ callbackUrl, redirect: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    logout,
    isLoading,
    error,
    clearError,
    isSigningIn: isLoading !== null,
  };
}

// Re-export signIn and signOut for direct usage
export { signIn, signOut };

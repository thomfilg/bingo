import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAuth, useSocialLogin, useDeviceDetection } from "../hooks";

// Get the mocked functions
vi.mock("next-auth/react");

const mockedUseSession = vi.mocked(useSession);
const mockedSignIn = vi.mocked(signIn);
const mockedSignOut = vi.mocked(signOut);

describe("auth hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useAuth", () => {
    it("should return unauthenticated state when no session", () => {
      mockedUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.session).toBeNull();
      expect(result.current.status).toBe("unauthenticated");
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isUnauthenticated).toBe(true);
      expect(result.current.user).toBeUndefined();
    });

    it("should return loading state", () => {
      mockedUseSession.mockReturnValue({
        data: null,
        status: "loading",
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isUnauthenticated).toBe(false);
    });

    it("should return authenticated state with user", () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      };

      mockedUseSession.mockReturnValue({
        data: {
          user: mockUser,
          expires: "2024-01-01",
        },
        status: "authenticated",
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isUnauthenticated).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe("useSocialLogin", () => {
    beforeEach(() => {
      mockedSignIn.mockResolvedValue(undefined);
      mockedSignOut.mockResolvedValue(undefined);
    });

    it("should have initial state with no loading and no error", () => {
      const { result } = renderHook(() => useSocialLogin());

      expect(result.current.isLoading).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isSigningIn).toBe(false);
    });

    it("should call signIn with google provider", async () => {
      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        await result.current.loginWithGoogle("/dashboard");
      });

      expect(mockedSignIn).toHaveBeenCalledWith("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    });

    it("should call signIn with facebook provider", async () => {
      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        await result.current.loginWithFacebook("/profile");
      });

      expect(mockedSignIn).toHaveBeenCalledWith("facebook", {
        callbackUrl: "/profile",
        redirect: true,
      });
    });

    it("should call signIn with apple provider", async () => {
      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        await result.current.loginWithApple("/settings");
      });

      expect(mockedSignIn).toHaveBeenCalledWith("apple", {
        callbackUrl: "/settings",
        redirect: true,
      });
    });

    it("should use default callback url when not provided", async () => {
      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        await result.current.loginWithGoogle();
      });

      expect(mockedSignIn).toHaveBeenCalledWith("google", {
        callbackUrl: "/",
        redirect: true,
      });
    });

    it("should call signOut", async () => {
      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        await result.current.logout("/goodbye");
      });

      expect(mockedSignOut).toHaveBeenCalledWith({
        callbackUrl: "/goodbye",
        redirect: true,
      });
    });

    it("should use generic login function with provider", async () => {
      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        await result.current.login("google", "/custom");
      });

      expect(mockedSignIn).toHaveBeenCalledWith("google", {
        callbackUrl: "/custom",
        redirect: true,
      });
    });

    it("should clear error when clearError is called", async () => {
      // Simulate an error state
      mockedSignIn.mockRejectedValueOnce(new Error("Test error"));

      const { result } = renderHook(() => useSocialLogin());

      await act(async () => {
        try {
          await result.current.loginWithGoogle();
        } catch {
          // Expected to fail
        }
      });

      // Wait for the error state to be set
      await waitFor(() => {
        expect(result.current.error).toBe("Test error");
      });

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("useDeviceDetection", () => {
    it("should return device info with all required properties", async () => {
      const { result } = renderHook(() => useDeviceDetection());

      // Wait for hydration to complete
      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      // Should have all device info properties
      expect(result.current).toHaveProperty("isAppleDevice");
      expect(result.current).toHaveProperty("isIOS");
      expect(result.current).toHaveProperty("isMac");
      expect(result.current).toHaveProperty("isSafari");
      expect(result.current).toHaveProperty("userAgent");
      expect(result.current).toHaveProperty("isHydrated");
    });

    it("should detect non-Apple device in jsdom environment", async () => {
      const { result } = renderHook(() => useDeviceDetection());

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      // jsdom doesn't have Apple user agent by default
      expect(result.current.isAppleDevice).toBe(false);
      expect(result.current.isIOS).toBe(false);
      expect(result.current.isMac).toBe(false);
    });
  });
});

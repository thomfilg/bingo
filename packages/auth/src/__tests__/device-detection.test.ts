import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  detectAppleDevice,
  shouldShowAppleSignIn,
  type DeviceInfo,
} from "../device-detection";

describe("device-detection", () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset mocks before each test
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
    });
  });

  describe("detectAppleDevice", () => {
    it("should return default values when no userAgent is provided in SSR", () => {
      // Simulate SSR environment by making window undefined
      const windowBackup = global.window;
      // @ts-expect-error - simulating SSR
      delete global.window;

      const result = detectAppleDevice();

      expect(result).toEqual({
        isAppleDevice: false,
        isIOS: false,
        isMac: false,
        isSafari: false,
        userAgent: "",
      });

      global.window = windowBackup;
    });

    it("should detect iPhone", () => {
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

      const result = detectAppleDevice(userAgent);

      expect(result.isIOS).toBe(true);
      expect(result.isAppleDevice).toBe(true);
      expect(result.isMac).toBe(false);
      expect(result.userAgent).toBe(userAgent);
    });

    it("should detect iPad", () => {
      const userAgent =
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

      const result = detectAppleDevice(userAgent);

      expect(result.isIOS).toBe(true);
      expect(result.isAppleDevice).toBe(true);
      expect(result.isMac).toBe(false);
    });

    it("should detect iPod", () => {
      const userAgent =
        "Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15";

      const result = detectAppleDevice(userAgent);

      expect(result.isIOS).toBe(true);
      expect(result.isAppleDevice).toBe(true);
    });

    it("should detect macOS", () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

      const result = detectAppleDevice(userAgent);

      expect(result.isMac).toBe(true);
      expect(result.isAppleDevice).toBe(true);
      expect(result.isIOS).toBe(false);
    });

    it("should detect Safari browser", () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

      const result = detectAppleDevice(userAgent);

      expect(result.isSafari).toBe(true);
    });

    it("should not detect Safari for Chrome on Mac", () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

      const result = detectAppleDevice(userAgent);

      expect(result.isSafari).toBe(false);
      expect(result.isMac).toBe(true);
    });

    it("should not detect Apple device for Windows", () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

      const result = detectAppleDevice(userAgent);

      expect(result.isAppleDevice).toBe(false);
      expect(result.isIOS).toBe(false);
      expect(result.isMac).toBe(false);
    });

    it("should not detect Apple device for Android", () => {
      const userAgent =
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

      const result = detectAppleDevice(userAgent);

      expect(result.isAppleDevice).toBe(false);
      expect(result.isIOS).toBe(false);
      expect(result.isMac).toBe(false);
    });

    it("should not detect Safari for Edge on Mac", () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";

      const result = detectAppleDevice(userAgent);

      expect(result.isSafari).toBe(false);
    });
  });

  describe("shouldShowAppleSignIn", () => {
    it("should return true when forceShow is true", () => {
      const result = shouldShowAppleSignIn(true);
      expect(result).toBe(true);
    });

    it("should return true for iPhone", () => {
      const userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

      const result = shouldShowAppleSignIn(false, userAgent);

      expect(result).toBe(true);
    });

    it("should return true for macOS", () => {
      const userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

      const result = shouldShowAppleSignIn(false, userAgent);

      expect(result).toBe(true);
    });

    it("should return false for Windows", () => {
      const userAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

      const result = shouldShowAppleSignIn(false, userAgent);

      expect(result).toBe(false);
    });

    it("should return false for Android", () => {
      const userAgent =
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36";

      const result = shouldShowAppleSignIn(false, userAgent);

      expect(result).toBe(false);
    });
  });

  describe("DeviceInfo type", () => {
    it("should have correct shape", () => {
      const deviceInfo: DeviceInfo = {
        isAppleDevice: true,
        isIOS: true,
        isMac: false,
        isSafari: true,
        userAgent: "test",
      };

      expect(deviceInfo).toHaveProperty("isAppleDevice");
      expect(deviceInfo).toHaveProperty("isIOS");
      expect(deviceInfo).toHaveProperty("isMac");
      expect(deviceInfo).toHaveProperty("isSafari");
      expect(deviceInfo).toHaveProperty("userAgent");
    });
  });
});

/**
 * Device detection utilities for determining Apple device usage
 * Used to conditionally show Apple Sign-In button
 */

export interface DeviceInfo {
  isAppleDevice: boolean;
  isIOS: boolean;
  isMac: boolean;
  isSafari: boolean;
  userAgent: string;
}

/**
 * Detects if the current device is an Apple device (iOS or macOS)
 * This is used to determine whether to show the Apple Sign-In button
 *
 * @param userAgent - Optional user agent string (for SSR usage)
 * @returns DeviceInfo object with detection results
 */
export function detectAppleDevice(userAgent?: string): DeviceInfo {
  // For SSR, return defaults if no userAgent provided
  if (typeof window === "undefined" && !userAgent) {
    return {
      isAppleDevice: false,
      isIOS: false,
      isMac: false,
      isSafari: false,
      userAgent: "",
    };
  }

  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  const uaLower = ua.toLowerCase();

  // iOS detection - iPhone, iPad, iPod
  // iPad on iOS 13+ reports as Mac in UA, so we need multiple detection strategies
  const hasIOSUserAgent = /iphone|ipad|ipod/.test(uaLower);

  // For SSR with UA string: detect iPad by checking for "Mac" + "Mobile" Safari indicator
  const isLikelyiPadFromUA = uaLower.includes("mac") && uaLower.includes("mobile");

  // For client-side: iPad on iOS 13+ reports as Mac but has touch support
  const isIPadWithTouchPoints =
    typeof navigator !== "undefined" &&
    "maxTouchPoints" in navigator &&
    navigator.maxTouchPoints > 1 &&
    uaLower.includes("mac");

  const isIOS = hasIOSUserAgent || isLikelyiPadFromUA || isIPadWithTouchPoints;

  // macOS detection
  const isMac = /macintosh|mac os x/.test(uaLower) && !isIOS;

  // Safari detection
  const isSafari = /safari/.test(uaLower) && !/chrome|chromium|edg/.test(uaLower);

  // Combined Apple device check
  const isAppleDevice = isIOS || isMac;

  return {
    isAppleDevice,
    isIOS,
    isMac,
    isSafari,
    userAgent: ua,
  };
}

/**
 * Check if Apple Sign-In should be displayed
 * Shows on all Apple devices (iOS and macOS) for better UX
 * Can also be shown on non-Apple devices but Apple recommends showing it primarily on their devices
 *
 * @param forceShow - Always show Apple Sign-In regardless of device
 * @param userAgent - Optional user agent for SSR
 * @returns boolean indicating whether to show Apple Sign-In
 */
export function shouldShowAppleSignIn(forceShow = false, userAgent?: string): boolean {
  if (forceShow) return true;

  const deviceInfo = detectAppleDevice(userAgent);
  return deviceInfo.isAppleDevice;
}

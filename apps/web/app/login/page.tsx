"use client";

import type { JSX } from "react";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SocialLoginButton, SocialLoginContainer } from "@repo/ui/social-login-button";
import { Alert } from "@repo/ui/data-display/Alert";
import { LoadingState } from "@repo/ui/data-display/LoadingState";
import { Container } from "@repo/ui/layout/Container";
import { Text } from "@repo/ui/typography/Text";
import { Spacer } from "@repo/ui/layout/Spacer";
import { useAuth, useSocialLogin, useDeviceDetection } from "@repo/auth/hooks";

function LoginContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: sessionLoading } = useAuth();
  const { loginWithGoogle, loginWithFacebook, loginWithApple, isLoading, error, clearError } = useSocialLogin();
  const { isAppleDevice, isHydrated } = useDeviceDetection();

  // Get callback URL from query params or default to home
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, callbackUrl, router]);

  // Get error from URL if redirected from auth error
  const urlError = searchParams.get("error");
  const errorMessage = error ?? (urlError ? getErrorMessage(urlError) : null);

  // Show loading state while checking session
  if (sessionLoading) {
    return (
      <Container variant="centered" padding="lg">
        <LoadingState
          variant="spinner"
          message="Loading..."
          size="md"
        />
      </Container>
    );
  }

  return (
    <Container variant="centered" padding="lg">
      <SocialLoginContainer title="Welcome back" showDivider={false}>
        <Text color="secondary" size="sm" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Sign in to continue to your account
        </Text>

        {errorMessage && (
          <Alert
            variant="danger"
            title="Sign in failed"
            description={errorMessage}
            closable
            onClose={clearError}
          />
        )}

        <Spacer size="md" />

        <SocialLoginButton
          provider="google"
          onClick={() => loginWithGoogle(callbackUrl)}
          loading={isLoading === "google"}
          disabled={isLoading !== null && isLoading !== "google"}
        />

        <Spacer size="sm" />

        <SocialLoginButton
          provider="facebook"
          onClick={() => loginWithFacebook(callbackUrl)}
          loading={isLoading === "facebook"}
          disabled={isLoading !== null && isLoading !== "facebook"}
        />

        {/* Show Apple Sign-In only on Apple devices (or when not yet hydrated to avoid layout shift) */}
        {(!isHydrated || isAppleDevice) && (
          <>
            <Spacer size="sm" />
            <SocialLoginButton
              provider="apple"
              onClick={() => loginWithApple(callbackUrl)}
              loading={isLoading === "apple"}
              disabled={isLoading !== null && isLoading !== "apple"}
            />
          </>
        )}

        <Spacer size="lg" />

        <Text color="secondary" size="xs" style={{ textAlign: 'center' }}>
          By continuing, you agree to our{" "}
          <a href="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</a>
        </Text>
      </SocialLoginContainer>
    </Container>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <Container variant="centered" padding="lg">
          <LoadingState
            variant="spinner"
            message="Loading..."
            size="md"
          />
        </Container>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

/**
 * Map NextAuth error codes to user-friendly messages
 */
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Access denied. You may not have permission to sign in.",
    Verification: "The verification link has expired or has already been used.",
    OAuthSignin: "Could not start the sign-in process. Please try again.",
    OAuthCallback: "Could not complete the sign-in process. Please try again.",
    OAuthCreateAccount: "Could not create your account. Please try again.",
    EmailCreateAccount: "Could not create your account. Please try again.",
    Callback: "Could not complete the sign-in. Please try again.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    EmailSignin: "Could not send the verification email. Please try again.",
    CredentialsSignin: "Sign in failed. Check your credentials and try again.",
    SessionRequired: "Please sign in to access this page.",
    Default: "An unexpected error occurred. Please try again.",
  };

  return errorMessages[error] ?? "An unexpected error occurred. Please try again.";
}

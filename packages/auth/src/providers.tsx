"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode, JSX } from "react";

interface AuthProviderProps {
  children: ReactNode;
  session?: Session | null;
}

/**
 * Auth Provider component that wraps the application
 * Provides session context to all child components
 */
export function AuthProvider({ children, session }: AuthProviderProps): JSX.Element {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
}

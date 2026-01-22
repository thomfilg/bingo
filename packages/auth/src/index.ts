import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import type { NextAuthConfig, Session, User } from "next-auth";
import { z } from "zod";

/**
 * Schema for validating auth environment variables
 * AUTH_SECRET is required, OAuth providers are optional (at least one should be configured)
 */
const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required for session encryption"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

// Lazy-evaluated environment config (only validated when accessed)
let _envCache: EnvConfig | null = null;

/**
 * Check if we're in a build-time context where env vars may not be available
 * This includes CI builds, static generation, etc.
 */
function isBuildTime(): boolean {
  // Explicit skip flag
  if (process.env.SKIP_ENV_VALIDATION === "true") return true;
  // Next.js build phase indicator
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  // AUTH_SECRET not available (likely build time)
  if (!process.env.AUTH_SECRET) return true;
  return false;
}

/**
 * Get validated environment variables (lazy evaluation)
 * Only validates when first accessed, avoiding build-time failures
 */
function getEnv(): EnvConfig {
  if (_envCache) return _envCache;

  // Skip validation during build time when env vars may not be available
  if (isBuildTime()) {
    return {
      AUTH_SECRET: process.env.AUTH_SECRET ?? "",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
      FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
      APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET,
    };
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${missing}`);
  }

  _envCache = result.data;
  return _envCache;
}

/**
 * Extended session type that includes user ID
 */
export interface ExtendedSession extends Session {
  user: Session["user"] & {
    id: string;
    provider?: string;
  };
}

/**
 * Build OAuth providers based on available environment variables
 * Only includes providers that have both client ID and secret configured
 */
function buildProviders() {
  const env = getEnv();
  const providers = [];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
        },
      })
    );
  }

  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
      Facebook({
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
      })
    );
  }

  if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
    providers.push(
      Apple({
        clientId: env.APPLE_CLIENT_ID,
        clientSecret: env.APPLE_CLIENT_SECRET,
      })
    );
  }

  return providers;
}

/**
 * Auth configuration for NextAuth.js v5
 * Supports Google, Facebook, and Apple OAuth providers (configured dynamically)
 */
export const authConfig: NextAuthConfig = {
  providers: buildProviders(),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in - safely handle potentially undefined user.id
      if (account && user) {
        return {
          ...token,
          id: user.id ?? token.sub ?? "",
          provider: account.provider,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and provider to session
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string) ?? "";
        (session.user as ExtendedSession["user"]).provider = token.provider as string | undefined;
      }
      return session as ExtendedSession;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home after sign in
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Only trust host in development; production should verify the host header
  trustHost: process.env.NODE_ENV === "development",
  debug: process.env.NODE_ENV === "development",
};

/**
 * Create NextAuth instance
 */
const nextAuth = NextAuth(authConfig);

/**
 * Export NextAuth handlers and utilities
 */
export const handlers = nextAuth.handlers;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
export const auth = nextAuth.auth;

/**
 * Type exports for consumers
 */
export type { Session, User, NextAuthConfig };

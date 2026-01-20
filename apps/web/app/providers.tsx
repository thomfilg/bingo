"use client";

import { AuthProvider } from "@repo/auth/providers";
import type { ReactNode, JSX } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}

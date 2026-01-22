"use client";

import * as React from "react";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
}

export function Button({ children, className, appName }: ButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      className={className}
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
}

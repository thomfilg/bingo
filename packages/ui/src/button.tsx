"use client";

import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  appName: string;
}

export function Button({ appName, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={() => alert(`Hello from ${appName}!`)}
      {...props}
    >
      {children}
    </button>
  );
}

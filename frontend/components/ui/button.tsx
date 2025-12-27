'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

// Lightweight button component inspired by shadcn/ui styling.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", size = "md", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

    const variantClasses =
      variant === "outline"
        ? "border border-slate-700 bg-transparent text-slate-50 hover:bg-slate-800/60"
        : variant === "ghost"
        ? "bg-transparent text-slate-200 hover:bg-slate-800/60"
        : "bg-brand text-brand-foreground hover:bg-teal-700";

    const sizeClasses =
      size === "sm"
        ? "px-3 py-1 text-xs"
        : size === "lg"
        ? "px-5 py-3 text-sm"
        : "px-4 py-2 text-sm";

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

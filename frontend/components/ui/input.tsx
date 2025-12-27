'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 shadow-sm outline-none placeholder:text-slate-500 focus:border-brand focus:ring-1 focus:ring-brand",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

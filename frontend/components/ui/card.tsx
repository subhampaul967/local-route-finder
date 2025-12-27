'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-slate-800 bg-slate-900/80 backdrop-blur-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

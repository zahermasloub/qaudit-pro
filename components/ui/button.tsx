import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-400": variant === "primary",
            "bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400": variant === "secondary",
            "bg-success-600 hover:bg-success-700 text-white focus:ring-success-400": variant === "success",
            "bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-400": variant === "warning",
            "bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-400": variant === "danger",
            "bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-400": variant === "ghost",
            "border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 focus:ring-brand-400": variant === "outline",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 px-3 py-1.5": size === "sm",
            "h-11 px-6 py-3": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };

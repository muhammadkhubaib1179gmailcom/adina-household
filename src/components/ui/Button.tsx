"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 active:scale-95",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-sm",
          size === "lg" && "px-8 py-4 text-base",
          variant === "primary" &&
            "bg-maroon text-white shadow-lg shadow-maroon/20 hover:-translate-y-0.5 hover:bg-maroon-dark",
          variant === "gold" &&
            "bg-gold text-plum shadow-lg shadow-gold/25 hover:-translate-y-0.5 hover:bg-gold-dark",
          variant === "outline" &&
            "border-2 border-maroon text-maroon hover:bg-maroon hover:text-white",
          variant === "ghost" && "text-maroon hover:bg-rose-light/50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
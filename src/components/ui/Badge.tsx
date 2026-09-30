"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "gold" | "new" | "soldout" | "stock"
  className?: string
}

export function Badge({ children, variant = "gold", className }: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-md backdrop-blur",
        variant === "gold" && "bg-gold text-plum",
        variant === "new" && "bg-maroon text-white",
        variant === "soldout" && "bg-danger text-white",
        variant === "stock" && "bg-success text-white",
        className
      )}
    >
      {children}
    </motion.span>
  )
}
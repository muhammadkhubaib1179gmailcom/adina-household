"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const OFFSETS: Record<string, string> = {
  "/": "40rem",
}

export function MaroonDotsBackground() {
  const pathname = usePathname()
  const top = OFFSETS[pathname] ?? "17rem"

  return (
    <div
      className="pointer-events-none absolute inset-x-0 -z-10 overflow-hidden"
      style={{ top, bottom: 0 }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          backgroundPosition: [
            "0% 0%",
            "3% -2%",
            "-2% 4%",
            "4% 2%",
            "-3% -3%",
            "2% 5%",
            "0% 0%",
          ],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #5a2442 1px, transparent 1px), radial-gradient(circle at 80% 20%, #5a2442 1px, transparent 1px), radial-gradient(circle at 50% 80%, #5a2442 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}
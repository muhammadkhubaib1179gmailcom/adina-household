"use client"

import { motion } from "framer-motion"

export function AdminParticlesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #5a2442 1px, transparent 1px), radial-gradient(circle at 80% 20%, #5a2442 1px, transparent 1px), radial-gradient(circle at 50% 80%, #5a2442 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}
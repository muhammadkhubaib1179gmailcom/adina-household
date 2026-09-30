"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"

export function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage()

  return (
    <motion.button
      onClick={toggleLocale}
      aria-label="Toggle language"
      className="relative flex items-center overflow-hidden rounded-full border-2 border-maroon bg-white"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="absolute inset-y-0 w-1/2 rounded-full bg-maroon shadow-md"
        animate={{ x: locale === "en" ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      />
      <span
        className={`relative z-10 w-12 py-1.5 text-center text-sm font-semibold ${
          locale === "en" ? "text-white" : "text-maroon"
        }`}
      >
        EN
      </span>
      <span
        className={`font-urdu relative z-10 w-14 py-1.5 text-center text-base font-bold ${
          locale === "ur" ? "text-white" : "text-maroon"
        }`}
      >
        اردو
      </span>
    </motion.button>
  )
}
"use client"

import { motion } from "framer-motion"

interface SectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "start"
}

export function SectionHeader({ eyebrow, title, description, align = "center" }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === "center" ? "text-center mx-auto" : "text-start"} max-w-2xl`}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
        {eyebrow}
      </p>
      <h2 className="font-serif-display text-4xl font-semibold leading-tight text-plum md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-soft">{description}</p>
      )}
      <motion.div
        className="mt-6 h-0.5 w-16 rounded-full bg-gold"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ margin: align === "center" ? "1.5rem auto 0" : "1.5rem 0 0" }}
      />
    </motion.div>
  )
}
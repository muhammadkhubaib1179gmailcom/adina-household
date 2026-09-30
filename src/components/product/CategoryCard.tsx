"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface CategoryCardProps {
  slug: string
  name: string
  nameUrdu: string
  image: string
  index?: number
}

export function CategoryCard({ slug, name, nameUrdu, image, index = 0 }: CategoryCardProps) {
  const { locale } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -10, rotateX: 4 }}
      style={{ transformPerspective: 1000 }}
    >
      <Link href={`/shop/${slug}`} className="group block">
        <div className="relative overflow-hidden rounded-3xl shadow-md transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-maroon/15">
          <div className="relative aspect-[3/4]">
            <Image
              src={image}
              alt={locale === "ur" ? nameUrdu : name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-plum/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
              <h3
                className={`text-xl font-semibold text-white drop-shadow-lg md:text-2xl ${
                  locale === "ur" ? "heading-urdu text-2xl" : "font-serif-display"
                }`}
              >
                {locale === "ur" ? nameUrdu : name}
              </h3>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mt-3 flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-gold"
              >
                {locale === "ur" ? "دریافت کریں" : "Explore"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
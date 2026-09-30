"use client"

import { motion } from "framer-motion"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/lib/data"

interface ProductGridProps {
  products: Product[]
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) return null

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  )
}
"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag, Heart, Play } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useCartStore } from "@/store/cartStore"
import { Badge } from "@/components/ui/Badge"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/data"
import { useState } from "react"

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { locale, t } = useLanguage()
  const addItem = useCartStore((s) => s.addItem)
  const firstVariant = product.variants[0]
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = () => {
    if (!firstVariant || product.soldOut || firstVariant.stock <= 0) return
    addItem({
      productId: product.id,
      variantId: firstVariant.id,
      slug: product.slug,
      name: product.name,
      nameUrdu: product.nameUrdu,
      variantName: firstVariant.name,
      variantNameUrdu: firstVariant.nameUrdu,
      image: product.images[0],
      price: firstVariant.price,
      stock: firstVariant.stock,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-3xl bg-cream-light shadow-sm transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-maroon/10">
          {/* Image/Video with zoom */}
          <div className="relative aspect-[4/5] overflow-hidden">
            {product.videoUrl && isHovered ? (
              <video
                src={product.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={product.images[0]}
                alt={locale === "ur" ? product.nameUrdu : product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-plum/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Video indicator */}
            {product.videoUrl && !isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm"
              >
                <Play className="h-3 w-3 fill-white text-white" />
                <span className="text-xs font-medium text-white">Video</span>
              </motion.div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.soldOut || firstVariant?.stock === 0 ? (
              <Badge variant="soldout">{t("product.outOfStock")}</Badge>
            ) : product.featured ? (
              <Badge variant="gold">✦ {locale === "ur" ? "نمایاں" : "Featured"}</Badge>
            ) : null}
          </div>

          {/* Wishlist */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            aria-label="Save to wishlist"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-plum shadow-md backdrop-blur transition-colors hover:text-danger"
          >
            <Heart className="h-5 w-5" />
          </motion.button>

          {/* Quick add on hover */}
          <div className="absolute inset-x-4 bottom-4 translate-y-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                handleAddToCart()
              }}
              disabled={product.soldOut || firstVariant?.stock === 0}
              className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white shadow-xl transition-colors ${
                product.soldOut || firstVariant?.stock === 0
                  ? "cursor-not-allowed bg-plum/40"
                  : "bg-maroon hover:bg-maroon-dark"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {t("product.addToCart")}
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
              {locale === "ur" ? product.categoryUrdu : product.category}
            </span>
            {firstVariant?.size && (
              <span className="text-xs text-ink-soft">{firstVariant.size}</span>
            )}
          </div>
          <h3
            className={`mt-1.5 line-clamp-2 font-bold text-plum transition-colors group-hover:text-maroon ${
              locale === "ur" ? "heading-urdu" : "font-serif-display text-xl tracking-tight"
            }`}
          >
            {locale === "ur" ? product.nameUrdu : product.name}
          </h3>
          <p className={`mt-1.5 font-serif-display text-xl font-bold text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
            {formatPrice(firstVariant?.price ?? product.basePrice, locale)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
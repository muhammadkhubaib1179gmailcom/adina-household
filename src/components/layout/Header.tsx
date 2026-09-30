"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion"
import {Menu, X, ShoppingBag, User, Phone, LayoutDashboard} from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useCartStore } from "@/store/cartStore"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { categories } from "@/lib/data"

export function Header() {
  const { locale, t, dir } = useLanguage()
  const { itemCount } = useCartStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartPulse, setCartPulse] = useState(false)
  const cartCount = itemCount()

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const prevCount = useRef(cartCount)
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartPulse(true)
      const t = setTimeout(() => setCartPulse(false), 600)
      prevCount.current = cartCount
      return () => clearTimeout(t)
    }
    prevCount.current = cartCount
  }, [cartCount])

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/shop/ceramics", label: "Ceramics" },
    { href: "/shop/cup-saucer-sets", label: t("sections.categories") },
    { href: "/shop/drinkware", label: "Drinkware" },
  ]

  return (
    <>
      {/* Top announcement bar - colorful gradient */}
      <div className="bg-gradient-to-r from-maroon via-rose to-gold text-center">
        <p className={`py-2 text-xs font-medium tracking-[0.2em] text-white uppercase ${locale === "ur" ? "font-urdu tracking-normal text-sm" : ""}`}>
          ✦ {locale === "ur" ? "پاکستان بھر میں ترسیل" : "Shipping across Pakistan"} ✦
        </p>
      </div>

      {/* Gradient behind the navigation bar */}
      <div className="relative bg-gradient-to-r from-pink-50 via-rose-100 to-pink-50">
        <motion.header
          initial={false}
          className={`sticky top-0 z-40 transition-all duration-300 ${
            scrolled
              ? "bg-cream/90 shadow-lg shadow-maroon/20 backdrop-blur-xl"
              : "bg-transparent"
          }`}
        >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start">
            <span className="font-serif-display text-xl font-bold tracking-tight text-maroon-dark md:text-2xl">
              Adina Household
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-[0.3em] text-gold-dark ${locale === "ur" ? "font-urdu text-xs tracking-normal" : ""}`}>
              {locale === "ur" ? "ادینہ ہاؤس ہولڈ" : "est. 2024"}
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`inline-block text-sm font-medium text-plum transition-all duration-200 hover:scale-110 hover:text-maroon ${
                    locale === "ur" ? "font-urdu text-base" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-plum transition-colors hover:bg-rose-light/40 sm:flex"
            >
              <User className="h-5 w-5" />
            </motion.button>

            {/* Admin */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-maroon transition-colors hover:bg-rose-light lg:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin</span>
            </Link>
            {/* Cart */}
            <motion.button
              onClick={() => setCartOpen(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              animate={cartPulse ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              aria-label="Open cart"
              className="relative flex h-10 items-center gap-2 rounded-full bg-maroon px-4 text-white shadow-lg shadow-maroon/20"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={cartCount}
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 14, opacity: 0 }}
                  className="text-sm font-bold"
                  suppressHydrationWarning
                >
                  {cartCount}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Mobile menu */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-plum hover:bg-rose-light/40 lg:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </nav>

        {/* Scroll progress */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-maroon via-gold to-maroon"
          style={{ scaleX: progress }}
          suppressHydrationWarning
        />
      </motion.header>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: dir === "rtl" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: dir === "rtl" ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 z-50 flex h-full w-80 flex-col bg-white shadow-2xl lg:hidden`}
            >
              <div className="flex items-center justify-between border-b border-line p-6">
                <span className="font-serif-display text-xl font-bold text-maroon-dark">
                  Adina Household
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-plum hover:bg-rose-light/40"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {[
                  { href: "/", label: t("nav.home") },
                  { href: "/shop", label: t("nav.shop") },
                  ...categories.map((c) => ({
                    href: `/shop/${c.slug}`,
                    label: locale === "ur" ? c.nameUrdu : c.name,
                  })),
                  { href: "/about", label: t("nav.about") },
                  { href: "/contact", label: t("nav.contact") },
                ].map((link, i) => (
                  <motion.li key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-plum transition-colors hover:bg-rose-light/40 hover:text-maroon ${
                        locale === "ur" ? "font-urdu text-base" : "font-medium"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="border-t border-line p-4">
                <a
                  href="https://wa.me/923249680850"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 rounded-full bg-success px-4 py-3 text-white ${locale === "ur" ? "font-urdu" : "font-medium"}`}
                >
                  <Phone className="h-4 w-4" />
                  {locale === "ur" ? "واٹس ایپ" : "WhatsApp"}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
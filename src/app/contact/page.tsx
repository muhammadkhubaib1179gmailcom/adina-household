"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Send } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"

export default function ContactPage() {
  const { locale, t } = useLanguage()
  const [sent, setSent] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !message) return
    const text = encodeURIComponent(`Hello! My name is ${name}. ${message} (Phone: ${phone})`)
    window.open(`https://wa.me/923249680850?text=${text}`, "_blank")
    setSent(true)
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
            ✦ ✦ ✦
          </p>
          <h1
            className={`text-5xl font-bold text-maroon ${
              locale === "ur" ? "heading-urdu" : "font-serif-display"
            }`}
          >
            {t("nav.contact")}
          </h1>
          <p className={`mt-3 text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
            {locale === "ur"
              ? "ہم سے رابطہ کریں — ہم مدد کے لیے حاضر ہیں"
              : "Get in touch — we are here to help"}
          </p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {[
              {
                icon: Phone,
                title: locale === "ur" ? "واٹس ایپ / فون" : "WhatsApp / Phone",
                value: "+92 324 9680850",
                href: "https://wa.me/923249680850",
              },
              {
                icon: Mail,
                title: locale === "ur" ? "ای میل" : "Email",
                value: "hello@adinahousehold.com",
              },
              {
                icon: MapPin,
                title: locale === "ur" ? "مقام" : "Location",
                value: locale === "ur" ? "پاکستان بھر میں ترسیل" : "Shipping across Pakistan",
              },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.href}
                target={item.href ? "_blank" : undefined}
                rel={item.href ? "noreferrer" : undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className={`text-sm text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
                    {item.title}
                  </p>
                  <p className={`font-semibold text-plum ${locale === "ur" ? "font-urdu text-lg" : ""}`}>
                    {item.value}
                  </p>
                </div>
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-gradient-to-br from-maroon to-rose p-6 text-center text-white"
            >
              <p className={`text-lg font-semibold ${locale === "ur" ? "heading-urdu text-xl" : ""}`}>
                {locale === "ur"
                  ? "شائع شدہ سوالات؟"
                  : "Follow us on Instagram"}
              </p>
              <p className={`mt-1 text-cream/90 ${locale === "ur" ? "font-urdu" : ""}`}>
                @adina.household
              </p>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8"
          >
            <h2 className={`mb-6 text-xl font-semibold text-plum ${locale === "ur" ? "heading-urdu text-2xl" : "font-serif-display"}`}>
              {locale === "ur" ? "پیغام بھیجیں" : "Send a message"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium text-plum ${locale === "ur" ? "font-urdu" : ""}`}>
                  {t("checkout.fullName")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream-light px-4 py-3 focus:border-maroon focus:outline-none"
                />
              </div>
              <div>
                <label className={`text-sm font-medium text-plum ${locale === "ur" ? "font-urdu" : ""}`}>
                  {t("checkout.phone")}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  type="tel"
                  placeholder="+92 3XX XXXXXXX"
                  className={`mt-1.5 w-full rounded-xl border border-line bg-cream-light px-4 py-3 focus:border-maroon focus:outline-none ${
                    locale === "ur" ? "text-right" : ""
                  }`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium text-plum ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur" ? "پیغام" : "Message"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className={`mt-1.5 w-full resize-none rounded-xl border border-line bg-cream-light px-4 py-3 focus:border-maroon focus:outline-none ${
                    locale === "ur" ? "text-right" : ""
                  }`}
                />
              </div>
              <Button type="submit" className="w-full gap-2" size="lg">
                <Send className="h-5 w-5" />
                {sent
                  ? locale === "ur"
                    ? "کھلا ہوا! (WhatsApp میں منتقل ہو رہا ہے)"
                    : "Opening WhatsApp... "
                  : locale === "ur"
                  ? "پیغام بھیجیں"
                  : "Send via WhatsApp"}
              </Button>
              <p className={`text-center text-xs text-ink-soft/70 ${locale === "ur" ? "font-urdu text-sm" : ""}`}>
                {locale === "ur"
                  ? "پیغام WhatsApp پر کھل جائے گا"
                  : "Your message will open in WhatsApp for fastest response"}
              </p>
            </div>
          </motion.form>
        </div>
      </main>
      <Footer />
    </>
  )
}
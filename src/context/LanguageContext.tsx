"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { translations, type Locale } from "@/lib/translations"
import { interpolate } from "@/lib/translations"

interface LanguageContextValue {
  locale: Locale
  dir: "ltr" | "rtl"
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: string, values?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const saved = localStorage.getItem("adina-locale") as Locale | null
    if (saved && (saved === "en" || saved === "ur")) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((locale: Locale) => {
    setLocaleState(locale)
    localStorage.setItem("adina-locale", locale)
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr"
    document.documentElement.lang = locale
  }, [])

  useEffect(() => {
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr"
    document.documentElement.lang = locale
  }, [locale])

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "ur" : "en")
  }, [locale, setLocale])

  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      const keys = key.split(".")
      let value: unknown = translations[locale]
      for (const k of keys) {
        if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[k]
        } else {
          return key
        }
      }
      const str = typeof value === "string" ? value : key
      return values ? interpolate(str, values) : str
    },
    [locale]
  )

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, dir: locale === "ur" ? "rtl" : "ltr", setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
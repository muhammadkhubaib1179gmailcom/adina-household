import type { Metadata } from "next"
import { Cormorant_Garamond, Inter, Noto_Nastaliq_Urdu } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/context/LanguageContext"
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"
import { MaroonDotsBackground } from "@/components/layout/MaroonDotsBackground"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-urdu",
})

export const metadata: Metadata = {
  title: "Adina Household — Curated Crockery for Your Home",
  description:
    "Discover beautiful ceramic bowls, mugs, tea cups, glass storage jars and dessert servers. Elegant crockery delivered across Pakistan.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${cormorant.variable} ${inter.variable} ${notoNastaliq.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <div className="relative isolate flex-1">
          <MaroonDotsBackground />
          <div className="relative z-10">
            <LanguageProvider>
              {children}
              <WhatsAppButton />
            </LanguageProvider>
          </div>
        </div>
      </body>
    </html>
  )
}
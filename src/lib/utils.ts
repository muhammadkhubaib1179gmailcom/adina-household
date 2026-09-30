import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, locale: "en" | "ur" = "en") {
  const formatted = price.toLocaleString("en-PK")
  return locale === "ur" ? `روپے ${formatted}` : `PKR ${formatted}`
}

export const deliveryCities = [
  { city: "Karachi", charge: 200, province: "Sindh" },
  { city: "Lahore", charge: 200, province: "Punjab" },
  { city: "Islamabad", charge: 250, province: "ICT" },
  { city: "Rawalpindi", charge: 250, province: "Punjab" },
  { city: "Faisalabad", charge: 250, province: "Punjab" },
  { city: "Multan", charge: 300, province: "Punjab" },
  { city: "Hyderabad", charge: 250, province: "Sindh" },
  { city: "Peshawar", charge: 350, province: "KPK" },
  { city: "Quetta", charge: 400, province: "Balochistan" },
  { city: "Sialkot", charge: 280, province: "Punjab" },
  { city: "Gujranwala", charge: 280, province: "Punjab" },
  { city: "Sargodha", charge: 300, province: "Punjab" },
  { city: "Abbottabad", charge: 350, province: "KPK" },
  { city: "Bahawalpur", charge: 350, province: "Punjab" },
]

export const provinces = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "ICT",
  "Gilgit-Baltistan",
  "Azad Kashmir",
]
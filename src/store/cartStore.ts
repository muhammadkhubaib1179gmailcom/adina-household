"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  productId: string
  variantId: string
  slug: string
  name: string
  nameUrdu: string
  variantName: string
  variantNameUrdu: string
  image: string
  price: number
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.variantId === item.variantId)
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, existing.stock)
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i
            ),
          })
        } else {
          set({ items: [...get().items, { ...item, quantity }] })
        }
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) })
      },
      updateQuantity: (variantId, quantity) => {
        set({
          items: get().items
            .map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })
      },
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "adina-cart",
    }
  )
)
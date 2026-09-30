"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, RefreshCw, Package, Phone, MapPin, Banknote } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"

interface Order {
  id: string
  order_number: string
  full_name: string
  phone: string
  email: string | null
  city: string
  address: string
  province: string | null
  payment_method: string
  subtotal: number
  delivery_charge: number
  total: number
  status: string
  notes: string | null
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  variant_title: string
  price: number
  quantity: number
  image: string | null
}

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const

const filterSequence = ["all", ...statuses]

const filterActive = (value: string) =>
  filterSequence.indexOf(value) % 2 === 0
    ? "bg-gradient-to-r from-coral-500 to-lagoon-500 text-white shadow-md shadow-coral-500/20"
    : "bg-gradient-to-r from-lagoon-500 to-lagoon-400 text-white shadow-md shadow-lagoon-500/20"

const statusColor: Record<string, string> = {
  pending: "bg-coral-500/15 text-coral-700",
  confirmed: "bg-lagoon-500/15 text-lagoon-800",
  shipped: "bg-coral-500/15 text-coral-800",
  delivered: "bg-lagoon-500/15 text-lagoon-900",
  cancelled: "bg-coral-500/15 text-coral-600",
}

const paymentLabel: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  bank: "Bank Transfer",
  cod: "Cash on Delivery",
}

function AdminOrdersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  const loadOrders = useCallback(async (statusFilter: string) => {
    setLoading(true)
    const qs = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : ""
    try {
      const res = await fetch(`/api/admin/orders${qs}`)
      const data = await res.json()
      setOrders(data.orders ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      const qs = filter && filter !== "all" ? `?status=${filter}` : ""
      try {
        const res = await fetch(`/api/admin/orders${qs}`)
        const data = await res.json()
        setOrders(data.orders ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [filter])

  useEffect(() => {
    const id = searchParams.get("o")
    if (id) {
      const found = orders.find((o) => o.id === id)
      if (found) {
        void Promise.resolve().then(() => {
          setSelected(found)
          router.replace("/admin/orders")
        })
      }
    }
  }, [searchParams, orders, router])

  const changeStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      if (selected && selected.id === id) setSelected({ ...selected, status })
    }
  }

  const clearSelected = () => setSelected(null)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">Orders</h1>
          <p className="mt-1 text-ink-soft">Manage incoming orders</p>
        </div>
        <button
          onClick={() => loadOrders(filter)}
          className="flex items-center gap-2 rounded-xl border border-line bg-[#fde8eb] px-4 py-2 text-sm font-medium text-lagoon-900 hover:bg-lagoon-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
            filter === "all" ? filterActive("all") : "bg-[#fde8eb] text-lagoon-800 border border-line hover:bg-lagoon-50"
          )}
        >
          All ({loading ? "…" : orders.length})
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all",
              filter === s ? filterActive(s) : "bg-[#fde8eb] text-lagoon-800 border border-line hover:bg-lagoon-50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-[#fde8eb] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-ink-soft">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-ink-soft">No {filter !== "all" ? filter : ""} orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-lagoon-50/60"
                  >
                    <td className="px-6 py-4 font-semibold text-coral-600">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-lagoon-900">{order.full_name}</p>
                      <p className="text-xs text-ink-soft">{order.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-ink-soft">{order.city}</td>
                    <td className="px-6 py-4 text-ink-soft">{paymentLabel[order.payment_method] ?? order.payment_method}</td>
                    <td className="px-6 py-4 font-medium text-lagoon-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 text-xs text-ink-soft">{order.created_at}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                        className="cursor-pointer rounded-full border-0 bg-transparent px-2 py-1 text-xs font-semibold focus:outline-none"
                        style={{ backgroundColor: "var(--tw-empty, transparent)" }}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s} className={statusColor[s]}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSelected}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-[#fde8eb] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line p-5">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-coral-600" />
                  <div>
                    <p className="text-base font-bold text-coral-600">{selected.order_number}</p>
                    <p className="text-xs text-ink-soft">{selected.created_at}</p>
                  </div>
                </div>
                <button onClick={clearSelected} className="flex h-9 w-9 items-center justify-center rounded-full text-lagoon-900 hover:bg-coral-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {/* Customer */}
                <div className="space-y-2 rounded-2xl border border-line p-4">
                  <p className="font-semibold text-lagoon-900">{selected.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    <Phone className="h-4 w-4" /> {selected.phone}
                  </div>
                  {selected.email && <p className="text-sm text-ink-soft">{selected.email}</p>}
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    <MapPin className="h-4 w-4" /> {selected.address}, {selected.city}
                    {selected.province ? `, ${selected.province}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    <Banknote className="h-4 w-4" /> {paymentLabel[selected.payment_method] ?? selected.payment_method}
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-lagoon-900">Items</p>
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-lagoon-900">{item.product_name}</p>
                        <p className="text-xs text-ink-soft">{item.variant_title} × {item.quantity}</p>
                      </div>
                      <p className="ml-3 text-sm font-medium text-lagoon-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 space-y-2 rounded-2xl border border-line p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Subtotal</span>
                    <span className="font-medium text-lagoon-900">{formatPrice(selected.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Delivery</span>
                    <span className="font-medium text-lagoon-900">{formatPrice(selected.delivery_charge)}</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2">
                    <span className="font-semibold text-lagoon-900">Total</span>
                    <span className="font-bold text-coral-600">{formatPrice(selected.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status control */}
              <div className="border-t border-line p-5">
                <p className="mb-2 text-sm font-semibold text-lagoon-900">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(selected.id, s)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors",
                        selected.status === s
                          ? "border-coral-500 bg-gradient-to-r from-coral-500 to-lagoon-500 text-white"
                          : "border-line bg-[#fde8eb] text-lagoon-900 hover:bg-lagoon-50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-soft">Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  )
}
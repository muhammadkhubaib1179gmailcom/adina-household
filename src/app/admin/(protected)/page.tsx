"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Package, Clock, Truck, CircleCheck, CircleX, Banknote, ArrowRight } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Stats {
  total: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
  revenue: number
}

interface RecentOrder {
  id: string
  order_number: string
  full_name: string
  city: string
  payment_method: string
  total: number
  status: string
  created_at: string
}

const paymentLabel: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  bank: "Bank Transfer",
  cod: "COD",
}

const statusColor: Record<string, string> = {
  pending: "bg-gold/15 text-gold-dark",
  confirmed: "bg-sky/10 text-sky-dark",
  shipped: "bg-purple/10 text-purple",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats)
        setRecentOrders(d.recentOrders ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Total Orders", value: stats?.total ?? 0, icon: Package, gradient: "from-coral-500 to-coral-300", chip: "bg-white/20" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, gradient: "from-lagoon-600 to-lagoon-400", chip: "bg-white/20" },
    { label: "Shipped", value: stats?.shipped ?? 0, icon: Truck, gradient: "from-coral-700 to-coral-400", chip: "bg-white/20" },
    { label: "Delivered", value: stats?.delivered ?? 0, icon: CircleCheck, gradient: "from-lagoon-700 to-lagoon-500", chip: "bg-white/20" },
    { label: "Revenue", value: stats?.revenue ?? 0, icon: Banknote, gradient: "from-coral-500 to-lagoon-500", chip: "bg-white/25", isMoney: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-orange-500">Dashboard</h1>
        <p className="mt-1 font-medium text-ink-soft">Store overview</p>
        <div className="mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-coral-500 to-lagoon-500" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg shadow-lagoon-900/10`}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.chip}`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-white">
              {loading ? "..." : card.isMoney ? formatPrice(card.value as number) : card.value}
            </p>
            <p className="text-sm font-medium text-white/85">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-line bg-[#fde8eb] shadow-lg shadow-lagoon-900/5"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-bold text-lagoon-900">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-coral-500 hover:underline">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-ink-soft">Loading...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-ink-soft">No orders yet — place an order on the store to see it here.</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line/50 last:border-0 hover:bg-cream-light/50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders?o=${order.id}`} className="font-semibold text-maroon hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-plum">{order.full_name}</td>
                    <td className="px-6 py-4 text-ink-soft">{order.city}</td>
                    <td className="px-6 py-4 text-ink-soft">{paymentLabel[order.payment_method] ?? order.payment_method}</td>
                    <td className="px-6 py-4 font-medium text-plum">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[order.status]}`}>
                        {order.status === "cancelled" && <CircleX className="h-3 w-3" />}
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Banknote,
  ChartLine,
  Users,
  PackageCheck,
  ShoppingBag,
  ArrowUpDown,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AnalyticsCard,
  BarList,
  EmptyState,
  LineChart,
  StackedBar,
  StatCard,
  Skeleton,
  type LineSeries,
} from "@/components/admin/charts"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Totals {
  grossSales: number
  discounts: number
  salesReversals: number
  netSales: number
  shippingCharges: number
  returnFees: number
  taxes: number
  totalSales: number
  orders: number
  activeOrders: number
  fulfilled: number
  aov: number
  returningCustomers: number
  allCustomers: number
  returningShare: number
}

interface SalesPoint {
  key: string
  orders: number
  gross: number
  net: number
  total: number
  aov: number
}

interface BreakdownRow {
  key: string
  label: string
  value: number
  kind: "add" | "subtract" | "derived" | "total"
  note?: string
}

interface ChannelRow {
  channel: string
  orders: number
  sales: number
  share: number
}

interface CityRow {
  city: string
  orders: number
  sales: number
}

interface ProductRow {
  productId: string
  name: string
  image: string | null
  units: number
  gross: number
  discounts: number
  net: number
  sellThrough: number
}

interface CohortRow {
  month: string
  label: string
  size: number
  retention: { offset: number; pct: number }[]
}

interface AnalyticData {
  range: { start: string; end: string; label: string }
  generatedAt: string
  totals: Totals
  salesOverTime: SalesPoint[]
  salesBreakdown: BreakdownRow[]
  breakdownChart: { key: string; label: string; value: number }[]
  salesByChannel: ChannelRow[]
  ordersByCity: CityRow[]
  aovOverTime: { key: string; orders: number; sales: number; aov: number }[]
  conversionOverTime: { key: string; orders: number; sessions: number; rate: number }[]
  salesByProduct: ProductRow[]
  cohorts: CohortRow[]
  dataSources: {
    sessions: { available: false; reason: string }
    conversion: { available: false; reason: string }
    channels: { available: boolean; note?: string }
    devices: { available: false; reason: string }
    locations: { available: false; reason: string }
    landingPages: { available: false; reason: string }
    referrers: { available: false; reason: string }
    socialReferrers: { available: false; reason: string }
    pos: { available: false; reason: string }
  }
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const fmtMoney = (n: number) => `PKR ${Math.round(n).toLocaleString("en-PK")}`
const fmtNum = (n: number) => n.toLocaleString("en-PK")
const pct = (n: number, digits = 1) => `${n.toLocaleString("en-PK", { maximumFractionDigits: digits })}%`

function axisLabel(key: string) {
  if (key.includes(" ")) {
    const [date, time] = key.split(" ")
    const [, m, d] = date.split("-")
    return `${d}/${m} ${time.slice(0, 2)}:00`
  }
  if (key.length === 7) {
    const [y, m] = key.split("-")
    const label = new Date(Date.UTC(+y, +m - 1, 1)).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    })
    return label
  }
  const [, m, d] = key.split("-")
  return `${d}/${m}`
}

/* ------------------------------------------------------------------ */
/* Date range presets                                                  */
/* ------------------------------------------------------------------ */

type PresetId = "today" | "yesterday" | "7d" | "30d" | "thisMonth" | "lastMonth" | "custom"

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "custom", label: "Custom" },
]

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function shiftDays(d: Date, days: number) {
  const clone = new Date(d)
  clone.setDate(clone.getDate() + days)
  return clone
}

function computeRange(preset: PresetId, custom?: { start: string; end: string }) {
  const today = new Date()
  switch (preset) {
    case "today":
      return { start: iso(today), end: iso(today), label: "Today" }
    case "yesterday": {
      const y = shiftDays(today, -1)
      return { start: iso(y), end: iso(y), label: "Yesterday" }
    }
    case "7d":
      return { start: iso(shiftDays(today, -6)), end: iso(today), label: "Last 7 days" }
    case "30d":
      return { start: iso(shiftDays(today, -29)), end: iso(today), label: "Last 30 days" }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start: iso(start), end: iso(today), label: "This month" }
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start: iso(start), end: iso(end), label: "Last month" }
    }
    case "custom":
      if (custom?.start && custom?.end) {
        return { start: custom.start, end: custom.end, label: `${custom.start} – ${custom.end}` }
      }
      return null
  }
}

/* ------------------------------------------------------------------ */
/* Breakdown table                                                     */
/* ------------------------------------------------------------------ */

function BreakdownTable({ rows }: { rows: BreakdownRow[] }) {
  return (
    <div className="divide-y divide-line overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => {
            const isTotal = row.kind === "total"
            return (
              <tr key={row.key} className={cn(isTotal && "bg-cream/70")}>
                <td className="py-2.5 pr-4">
                  <span className={cn("flex items-center gap-2", isTotal ? "font-semibold text-lagoon-900" : "text-ink")}>
                    {row.label}
                    {row.note && (
                      <span
                        className="cursor-help text-ink-soft underline decoration-dotted"
                        title={row.note}
                      >
                        ⓘ
                      </span>
                    )}
                  </span>
                </td>
                <td
                  className={cn(
                    "py-2.5 text-right tabular-nums",
                    row.kind === "subtract" && row.value !== 0 && "text-danger",
                    row.kind === "add" && "text-lagoon-900",
                    isTotal && "font-bold text-coral-600",
                  )}
                >
                  {fmtMoney(row.value)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sort header helper for product table                                */
/* ------------------------------------------------------------------ */

type SortKey = "units" | "gross" | "net" | "sellThrough" | "name"
type SortDir = "asc" | "desc"

function SortHeader({
  label,
  k,
  sortKey,
  onSort,
}: {
  label: string
  k: SortKey
  sortKey: SortKey
  onSort: (k: SortKey) => void
}) {
  return (
    <button
      onClick={() => onSort(k)}
      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-coral-600"
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3", sortKey === k && "text-coral-600")} />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Main dashboard                                                      */
/* ------------------------------------------------------------------ */

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState<PresetId>("30d")
  const [applied, setApplied] = useState(computeRange("30d"))
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [data, setData] = useState<AnalyticData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [salesMetric, setSalesMetric] = useState<"total" | "net" | "gross">("total")
  const [sortKey, setSortKey] = useState<SortKey>("gross")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const applyPreset = (p: PresetId) => {
    if (p === "custom") {
      setPreset("custom")
      return
    }
    setPreset(p)
    setLoading(true)
    setError(null)
    setApplied(computeRange(p))
  }

  const applyCustom = () => {
    if (!customStart || !customEnd) return
    if (customStart > customEnd) {
      setError("Custom start date cannot be after end date")
      return
    }
    setError(null)
    setLoading(true)
    setApplied(computeRange("custom", { start: customStart, end: customEnd }))
  }

  useEffect(() => {
    if (!applied) return
    let cancelled = false
    fetch(
      `/api/admin/analytics?start=${applied.start}&end=${applied.end}&label=${encodeURIComponent(applied.label)}`,
    )
      .then(async (r) => {
        const json = await r.json().catch(() => null)
        if (!r.ok) throw new Error(json?.error ?? "Failed to load analytics")
        return json as AnalyticData
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load analytics")
          setData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applied])

  const salesSeries: LineSeries[] = useMemo(() => {
    if (!data) return []
    return data.salesOverTime.map((s) => ({
      key: s.key,
      value: s[salesMetric],
    }))
  }, [data, salesMetric])

  const aovSeries: LineSeries[] = useMemo(() => {
    if (!data) return []
    return data.aovOverTime.map((s) => ({ key: s.key, value: s.aov }))
  }, [data])

  const sortedProducts = useMemo(() => {
    if (!data) return []
    const arr = [...data.salesByProduct]
    arr.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av
      }
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return arr
  }, [data, sortKey, sortDir])

  const onSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(k)
      setSortDir(k === "name" ? "asc" : "desc")
    }
  }

  const activeSalesMetric: Record<string, string> = {
    total: "Total sales",
    net: "Net sales",
    gross: "Gross sales",
  }

  if (loading && !data) return <Skeleton />

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-lagoon-900">Analytics</h1>
            <p className="mt-1 text-ink-soft">Sales, products and traffic insights</p>
          </div>
        </div>
        {error ? (
          <div className="rounded-2xl border border-line bg-[#fde8eb] p-8 text-center text-sm text-danger">
            {error}
          </div>
        ) : (
          <AnalyticsCard>
            <EmptyState reason="There is no data for the selected period." />
          </AnalyticsCard>
        )}
      </div>
    )
  }

  const t = data.totals
  const maxCohortOffsets = Math.max(0, ...data.cohorts.map((c) => c.retention.length - 1))

  return (
    <div className="space-y-6">
      {/* Header + date filter */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-lagoon-900">Analytics</h1>
          <p className="mt-1 flex items-center gap-1.5 text-ink-soft">
            <Calendar className="h-4 w-4" /> {data.range.label} · updated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-[#fde8eb] p-2 shadow-sm">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                preset === p.id ? "bg-coral-500 text-white" : "text-lagoon-900 hover:bg-cream-light",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-[#fde8eb] p-3 shadow-sm">
            <label className="text-xs text-ink-soft">
              From
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="mt-1 block rounded-lg border border-line bg-cream px-2 py-1.5 text-sm text-ink focus:border-coral-400 focus:outline-none"
              />
            </label>
            <label className="text-xs text-ink-soft">
              To
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="mt-1 block rounded-lg border border-line bg-cream px-2 py-1.5 text-sm text-ink focus:border-coral-400 focus:outline-none"
              />
            </label>
            <button
              onClick={applyCustom}
              className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-semibold text-white hover:bg-coral-600"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Top summary metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Sales"
          value={fmtMoney(t.grossSales)}
          sub={`${fmtNum(t.activeOrders)} orders in period`}
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          label="Returning Customers"
          value={`${fmtNum(t.returningCustomers)}`}
          sub={`${pct(t.returningShare * 100)} of ${fmtNum(t.allCustomers)} customers`}
          icon={<Users className="h-5 w-5" />}
          tone="gold"
        />
        <StatCard
          label="Orders Fulfilled"
          value={`${fmtNum(t.fulfilled)}`}
          sub={`of ${fmtNum(t.orders)} total orders`}
          icon={<PackageCheck className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Orders"
          value={`${fmtNum(t.orders)}`}
          sub={fmtMoney(t.grossSales + t.shippingCharges)}
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      {/* Sales over time */}
      <AnalyticsCard
        title="Sales over time"
        subtitle={`Total sales for ${data.range.label}`}
        action={
          <div className="flex gap-1 rounded-lg bg-cream p-1">
            {(["total", "net", "gross"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSalesMetric(m)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  salesMetric === m ? "bg-[#fde8eb] text-coral-600 shadow-sm" : "text-ink-soft hover:text-lagoon-900",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
          <span className="font-semibold text-lagoon-900">{activeSalesMetric[salesMetric]}</span>
          <span>·</span>
          <span>{fmtMoney(salesSeries.reduce((s, p) => s + p.value, 0))}</span>
        </div>
        <LineChart data={salesSeries} formatValue={fmtMoney} formatLabel={axisLabel} />
      </AnalyticsCard>

      {/* Sales breakdown + Total sales breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsCard
          title="Sales breakdown"
          subtitle="How the selected period's sales are composed"
        >
          <BreakdownTable rows={data.salesBreakdown} />
        </AnalyticsCard>

        <AnalyticsCard
          title="Total sales breakdown"
          subtitle="Composition of total sales (net sales + shipping + return fees + taxes)"
        >
          <StackedBar
            segments={[
              { label: "Net sales", value: data.breakdownChart[0]?.value ?? 0, className: "bg-coral-500" },
              { label: "Shipping", value: data.breakdownChart[1]?.value ?? 0, className: "bg-gold" },
              { label: "Return fees", value: data.breakdownChart[2]?.value ?? 0, className: "bg-rose" },
              { label: "Taxes", value: data.breakdownChart[3]?.value ?? 0, className: "bg-lagoon-900" },
            ]}
            formatValue={fmtMoney}
          />
        </AnalyticsCard>
      </div>

      {/* Sessions over time + conversion */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsCard
          title="Sessions over time"
          subtitle="Website sessions per period"
        >
          <EmptyState reason={data.dataSources.sessions.reason} />
        </AnalyticsCard>

        <AnalyticsCard
          title="Conversion rate over time"
          subtitle="Orders ÷ sessions, shown per bucket"
        >
          <EmptyState reason={data.dataSources.conversion.reason} />
        </AnalyticsCard>
      </div>

      {/* Sales by channel + AOV */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsCard
          title="Total sales by sales channel"
          subtitle="Channel attribution"
        >
          <BarList
            rows={data.salesByChannel.map((c) => ({
              label: c.channel,
              value: c.sales,
              share: c.share,
              sub: `${fmtNum(c.orders)} orders`,
            }))}
            formatValue={fmtMoney}
            formatShare={(s) => pct(s, 0)}
            color="bg-coral-500"
            emptyReason={data.dataSources.channels.available ? undefined : "No sales exist for this period."}
          />
          {data.dataSources.channels.note && (
            <p className="mt-4 rounded-lg bg-cream/80 px-3 py-2 text-xs text-ink-soft">
              {data.dataSources.channels.note}
            </p>
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Average order value over time"
          subtitle="Total sales ÷ active (non-cancelled) orders per bucket"
        >
          <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
            <span className="font-semibold text-lagoon-900">AOV</span>
            <span>·</span>
            <span>
              {fmtMoney(t.aov)} over {fmtNum(t.activeOrders)} orders
            </span>
          </div>
          <LineChart data={aovSeries} formatValue={fmtMoney} formatLabel={axisLabel} color="#c19a2e" />
        </AnalyticsCard>
      </div>

      {/* Product performance table */}
      <AnalyticsCard
        title="Total sales by product"
        subtitle="Gross and net sales per product (discounts not tracked per order; net = gross)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-soft">
                <th className="px-2 py-3 text-left font-medium uppercase tracking-wider">
                  <SortHeader label="Product" k="name" sortKey={sortKey} onSort={onSort} />
                </th>
                <th className="px-2 py-3 text-right font-medium uppercase tracking-wider">
                  <SortHeader label="Units" k="units" sortKey={sortKey} onSort={onSort} />
                </th>
                <th className="px-2 py-3 text-right font-medium uppercase tracking-wider">
                  <SortHeader label="Gross" k="gross" sortKey={sortKey} onSort={onSort} />
                </th>
                <th className="px-2 py-3 text-right font-medium uppercase tracking-wider">Discounts</th>
                <th className="px-2 py-3 text-right font-medium uppercase tracking-wider">
                  <SortHeader label="Net" k="net" sortKey={sortKey} onSort={onSort} />
                </th>
                <th className="px-2 py-3 text-right font-medium uppercase tracking-wider">Total sales</th>
                <th className="px-2 py-3 text-right font-medium uppercase tracking-wider">
                  <SortHeader label="Sell-through" k="sellThrough" sortKey={sortKey} onSort={onSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-10 text-center text-ink-soft">
                    No products sold in this period.
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-line/50 last:border-0 hover:bg-cream-light/60">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} width={40} height={40} unoptimized className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-soft">NA</div>
                          )}
                        </div>
                        <span className="min-w-0 truncate font-medium text-lagoon-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums text-ink">{fmtNum(p.units)}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-lagoon-900">{fmtMoney(p.gross)}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-ink-soft">{fmtMoney(p.discounts)}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-lagoon-900">{fmtMoney(p.net)}</td>
                    <td className="px-2 py-3 text-right tabular-nums font-medium text-lagoon-900">{fmtMoney(p.net)}</td>
                    <td className="px-2 py-3 text-right">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-16 text-xs text-ink-soft">{pct(p.sellThrough * 100)}</span>
                        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-cream">
                          <span
                            className="block h-full rounded-full bg-coral-500"
                            style={{ width: `${Math.min(100, p.sellThrough * 100)}%` }}
                          />
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AnalyticsCard>

      {/* Cohort analysis */}
      <AnalyticsCard
        title="Customer cohort analysis"
        subtitle="Retention (%) of shoppers who made a purchase in later months, by month of first purchase"
      >
        {data.cohorts.length === 0 ? (
          <EmptyState reason="Cohort analysis needs at least one order with a known customer." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-soft">
                  <th className="px-3 py-2 font-medium uppercase tracking-wider">Cohort</th>
                  <th className="px-3 py-2 font-medium uppercase tracking-wider">Size</th>
                  {Array.from({ length: maxCohortOffsets + 1 }).map((_, i) => (
                    <th key={i} className="px-3 py-2 text-right font-medium uppercase tracking-wider">
                      M{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((c) => (
                  <tr key={c.month} className="border-b border-line/50 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-lagoon-900">{c.label}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{fmtNum(c.size)}</td>
                    {Array.from({ length: maxCohortOffsets + 1 }).map((_, i) => {
                      const cell = c.retention.find((r) => r.offset === i)
                      return (
                        <td
                          key={i}
                          className={cn(
                            "px-3 py-2.5 text-right tabular-nums",
                            cell === undefined
                              ? "text-ink-faint"
                              : cell.pct > 0
                                ? "text-coral-600"
                                : "text-ink-soft",
                          )}
                        >
                          {cell === undefined ? "–" : pct(cell.pct)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnalyticsCard>

      {/* Traffic / acquisition sections (no session tracking → empty states) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard title="Sessions by device type">
          <EmptyState reason={data.dataSources.devices.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Sessions by location">
          <div className="mb-3">
            <p className="text-xs text-ink-soft">
              Session geo-data isn&apos;t tracked. Below is order location data instead:
            </p>
          </div>
          <BarList
            rows={data.ordersByCity.map((c) => ({
              label: c.city,
              value: c.sales,
              share: t.totalSales > 0 ? (c.sales / Math.max(1, t.totalSales)) * 100 : 0,
              sub: `${fmtNum(c.orders)} orders`,
            }))}
            formatValue={fmtMoney}
            color="bg-coral-500"
          />
        </AnalyticsCard>

        <AnalyticsCard title="Total sales by social referrer">
          <EmptyState reason={data.dataSources.socialReferrers.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Sessions by social referrer">
          <EmptyState reason={data.dataSources.socialReferrers.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Sessions by landing page">
          <EmptyState reason={data.dataSources.landingPages.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Performance by referring channel">
          <EmptyState reason={data.dataSources.referrers.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Total sales by referrer">
          <EmptyState reason={data.dataSources.referrers.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Sessions by referrer">
          <EmptyState reason={data.dataSources.referrers.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Conversion rate breakdown">
          <EmptyState reason={data.dataSources.conversion.reason} />
        </AnalyticsCard>
      </div>

      {/* Sell-through */}
      <AnalyticsCard
        title="Products by sell-through rate"
        subtitle={
          "Sell-through = units sold in the selected period ÷ (units sold + units currently in stock). " +
          "Historical starting stock isn't tracked, so this is an approximation from current inventory."
        }
        action={<ChartLine className="h-5 w-5 text-ink-soft" />}
      >
        {data.salesByProduct.length === 0 ? (
          <EmptyState reason="No products were sold in the selected period." />
        ) : (
          <div className="space-y-3">
            {[...data.salesByProduct]
              .sort((a, b) => b.sellThrough - a.sellThrough)
              .map((p) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} width={36} height={36} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-soft">NA</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-lagoon-900">{p.name}</p>
                      <span className="shrink-0 text-xs text-ink-soft">
                        {fmtNum(p.units)} sold · {pct(p.sellThrough * 100)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${Math.min(100, p.sellThrough * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </AnalyticsCard>

      {/* POS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsCard title="POS staff sales total">
          <EmptyState reason={data.dataSources.pos.reason} />
        </AnalyticsCard>

        <AnalyticsCard title="Total sales by POS location">
          <EmptyState reason={data.dataSources.pos.reason} />
        </AnalyticsCard>
      </div>
    </div>
  )
}
import { DatabaseSync } from "node:sqlite"
import path from "path"

const DB_PATH = path.join(process.cwd(), "adina.db")

let db: DatabaseSync

function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH)
    db.exec("PRAGMA journal_mode = WAL")
  }
  return db
}

/* ------------------------------------------------------------------ */
/* Range helpers                                                       */
/* ------------------------------------------------------------------ */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export interface AnalyticsRangeInput {
  /** Inclusive start date, YYYY-MM-DD */
  start: string
  /** Inclusive end date, YYYY-MM-DD */
  end: string
  /** Human friendly range label supplied by the UI */
  label?: string
}

export interface RangeBounds {
  startMs: number
  endInclusiveMs: number
  endExclusiveMs: number
  startStr: string
  endStr: string
  spanDays: number
  label: string
}

export function buildRangeBounds(input: AnalyticsRangeInput, defaultLabel?: string): RangeBounds {
  const { start, end } = input
  if (!DATE_RE.test(start) || !DATE_RE.test(end)) {
    throw new Error("start and end must be dates in YYYY-MM-DD format")
  }
  const [sy, sm, sd] = start.split("-").map(Number)
  const [ey, em, ed] = end.split("-").map(Number)
  const startMs = Date.UTC(sy, sm - 1, sd)
  const endInclusiveMs = Date.UTC(ey, em - 1, ed)
  if (startMs > endInclusiveMs) {
    throw new Error("start date cannot be after end date")
  }
  const endExclusiveMs = endInclusiveMs + 86400000
  return {
    startMs,
    endInclusiveMs,
    endExclusiveMs,
    startStr: `${start} 00:00:00`,
    endStr: `${new Date(endExclusiveMs).toISOString().slice(0, 10)} 00:00:00`,
    spanDays: Math.round((endExclusiveMs - startMs) / 86400000),
    label: input.label ?? defaultLabel ?? `${start} - ${end}`,
  }
}

type Granularity = "hour" | "day" | "week" | "month"

function granularityFor(spanDays: number): Granularity {
  if (spanDays <= 2) return "hour"
  if (spanDays <= 92) return "day"
  if (spanDays <= 366) return "week"
  return "month"
}

function bucketKey(createdAt: string, g: Granularity): string {
  switch (g) {
    case "hour":
      return `${createdAt.slice(0, 13)}:00`
    case "day":
      return createdAt.slice(0, 10)
    case "month":
      return createdAt.slice(0, 7)
    case "week": {
      const d = new Date(
        Date.UTC(+createdAt.slice(0, 4), +createdAt.slice(5, 7) - 1, +createdAt.slice(8, 10)),
      )
      const sinceMonday = (d.getUTCDay() + 6) % 7
      d.setUTCDate(d.getUTCDate() - sinceMonday)
      return d.toISOString().slice(0, 10)
    }
  }
}

interface BucketMeta {
  key: string
  from: number
  to: number
}

function keyFromMs(ms: number, g: Granularity): string {
  const d = new Date(ms)
  const iso = d.toISOString()
  switch (g) {
    case "hour":
      return `${iso.slice(0, 10)} ${iso.slice(11, 13)}:00`
    case "day":
      return iso.slice(0, 10)
    case "month":
      return iso.slice(0, 7)
    case "week": {
      const sinceMonday = (d.getUTCDay() + 6) % 7
      d.setUTCDate(d.getUTCDate() - sinceMonday)
      return d.toISOString().slice(0, 10)
    }
  }
}

function enumerateBuckets(bounds: RangeBounds, g: Granularity): BucketMeta[] {
  const out: BucketMeta[] = []
  let cur = bounds.startMs
  while (cur < bounds.endExclusiveMs) {
    const to =
      g === "hour"
        ? cur + 3600000
        : g === "day"
          ? cur + 86400000
          : g === "week"
            ? cur + 7 * 86400000
            : nextMonth(cur)
    out.push({ key: keyFromMs(cur, g), from: cur, to })
    cur = to
  }
  return out
}

function nextMonth(ms: number): number {
  const d = new Date(ms)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)
}

/* ------------------------------------------------------------------ */
/* Record shapes                                                        */
/* ------------------------------------------------------------------ */

interface OrderRow {
  id: string
  phone: string
  email: string | null
  city: string
  province: string | null
  payment_method: string
  subtotal: number
  delivery_charge: number
  total: number
  status: string
  created_at: string
}

interface LightOrderRow {
  phone: string
  created_at: string
}

interface ProductSalesRow {
  product_id: string
  product_name: string
  image: string | null
  units: number
  gross: number
  stock: number | null
}

const CANCELED = "cancelled"
const FULFILLED = "delivered"

export function normalizePhone(phone: string): string {
  return (phone ?? "").replace(/\D/g, "")
}

/* ------------------------------------------------------------------ */
/* Main entry                                                          */
/* ------------------------------------------------------------------ */

export type DataSourceFlag =
  | { available: true; note?: string }
  | { available: false; reason: string }

export interface AnalyticsDashboard {
  range: { start: string; end: string; label: string }
  generatedAt: string
  totals: {
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
  salesOverTime: {
    key: string
    orders: number
    gross: number
    net: number
    total: number
    aov: number
  }[]
  salesBreakdown: {
    key: string
    label: string
    value: number
    kind: "add" | "subtract" | "derived" | "total"
    note?: string
  }[]
  breakdownChart: { key: string; label: string; value: number }[]
  salesByChannel: { channel: string; orders: number; sales: number; share: number }[]
  ordersByCity: { city: string; orders: number; sales: number }[]
  aovOverTime: { key: string; orders: number; sales: number; aov: number }[]
  conversionOverTime: { key: string; orders: number; sessions: number; rate: number }[]
  salesByProduct: {
    productId: string
    name: string
    image: string | null
    units: number
    gross: number
    discounts: number
    net: number
    sellThrough: number
  }[]
  cohorts: {
    month: string
    label: string
    size: number
    retention: { offset: number; pct: number }[]
  }[]
  sessionsByCategory: { label: string; sessions: number }[]
  dataSources: {
    sessions: DataSourceFlag
    conversion: DataSourceFlag
    channels: DataSourceFlag
    devices: DataSourceFlag
    locations: DataSourceFlag
    landingPages: DataSourceFlag
    referrers: DataSourceFlag
    socialReferrers: DataSourceFlag
    pos: DataSourceFlag
  }
}

const round = (n: number) => Math.round(n * 100) / 100

export function getAnalyticsDashboard(input: AnalyticsRangeInput): AnalyticsDashboard {
  const bounds = buildRangeBounds(input)
  const database = getDb()

  const orders = database
    .prepare(
      `SELECT id, phone, email, city, province, payment_method, subtotal, delivery_charge, total, status, created_at
         FROM orders
        WHERE created_at >= ? AND created_at < ?
        ORDER BY created_at ASC`,
    )
    .all(bounds.startStr, bounds.endStr) as unknown as OrderRow[]

  const allOrders = database
    .prepare(`SELECT phone, created_at FROM orders ORDER BY created_at ASC`)
    .all() as unknown as LightOrderRow[]

  const productRows = database
    .prepare(
      `SELECT oi.product_id, oi.product_name, COALESCE(NULLIF(oi.image, ''), p.image) AS image,
              SUM(oi.quantity) AS units, SUM(oi.price * oi.quantity) AS gross, p.stock
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id AND o.status != ?
         LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.created_at >= ? AND o.created_at < ?
        GROUP BY oi.product_id
        ORDER BY gross DESC`,
    )
    .all(CANCELED, bounds.startStr, bounds.endStr) as unknown as ProductSalesRow[]

  /* ------------------------- totals -------------------------------- */

  let grossSales = 0
  let shippingCharges = 0
  let salesReversals = 0
  let fulfilled = 0
  const activeOrders: OrderRow[] = []
  const rangePhones = new Set<string>()

  for (const o of orders) {
    if (o.status === CANCELED) {
      salesReversals += o.total
    } else {
      grossSales += o.subtotal
      shippingCharges += o.delivery_charge
      activeOrders.push(o)
      const ph = normalizePhone(o.phone)
      if (ph) rangePhones.add(ph)
    }
    if (o.status === FULFILLED) fulfilled += 1
  }

  const discounts = 0
  const returnFees = 0
  const taxes = 0
  const netSales = grossSales - discounts - salesReversals
  const totalSales = netSales + shippingCharges + returnFees + taxes
  const ordersCount = orders.length
  const activeCount = activeOrders.length
  const aov = activeCount > 0 ? round(totalSales / activeCount) : 0

  /* ---------------------- returning customers ---------------------- */

  const firstPurchaseByPhone = new Map<string, number>()
  for (const o of allOrders) {
    const ph = normalizePhone(o.phone)
    if (!ph) continue
    const ts = Date.parse(`${o.created_at.slice(0, 10)}T${o.created_at.slice(11, 19)}Z`)
    const prev = firstPurchaseByPhone.get(ph)
    if (prev === undefined || ts < prev) firstPurchaseByPhone.set(ph, ts)
  }

  let returningCustomers = 0
  for (const ph of rangePhones) {
    const firstTs = firstPurchaseByPhone.get(ph)
    if (firstTs !== undefined && firstTs < bounds.startMs) returningCustomers += 1
  }
  const allCustomers = rangePhones.size
  const returningShare = allCustomers > 0 ? round(returningCustomers / allCustomers) : 0

  /* -------------------------- time series -------------------------- */

  const g = granularityFor(bounds.spanDays)
  const buckets = enumerateBuckets(bounds, g)

  interface BucketAgg {
    orders: number
    active: number
    gross: number
    reversals: number
    shipping: number
  }
  const agg = new Map<string, BucketAgg>()
  for (const b of buckets) agg.set(b.key, { orders: 0, active: 0, gross: 0, reversals: 0, shipping: 0 })

  for (const o of orders) {
    const key = bucketKey(o.created_at, g)
    const bucket = agg.get(key)
    if (!bucket) continue
    bucket.orders += 1
    if (o.status === CANCELED) {
      bucket.reversals += o.total
    } else {
      bucket.active += 1
      bucket.gross += o.subtotal
      bucket.shipping += o.delivery_charge
    }
  }

  const salesOverTime = buckets.map((b) => {
    const a = agg.get(b.key)!
    const net = a.gross - a.reversals
    const total = net + a.shipping
    return {
      key: b.key,
      orders: a.orders,
      gross: round(a.gross),
      net: round(net),
      total: round(total),
      aov: a.active > 0 ? round(total / a.active) : 0,
    }
  })

  const aovOverTime = salesOverTime.map((s) => ({
    key: s.key,
    orders: s.orders,
    sales: s.total,
    aov: s.aov,
  }))

  /* ------------------------ sales breakdown ------------------------ */

  const salesBreakdown = [
    { key: "gross", label: "Gross sales", value: round(grossSales), kind: "add" as const },
    { key: "discounts", label: "Discounts", value: -discounts, kind: "subtract" as const, note: "Discounts are not tracked per order." },
    { key: "reversals", label: "Sales reversals", value: -round(salesReversals), kind: "subtract" as const, note: "Cancelled order totals in the selected period." },
    { key: "net", label: "Net sales", value: round(netSales), kind: "derived" as const, note: "Gross sales − discounts − sales reversals." },
    { key: "shipping", label: "Shipping charges", value: round(shippingCharges), kind: "add" as const },
    { key: "returnFees", label: "Return fees", value: -returnFees, kind: "subtract" as const, note: "No returns are tracked on this store." },
    { key: "taxes", label: "Taxes", value: taxes, kind: "add" as const, note: "No tax records exist for this store." },
    { key: "total", label: "Total sales", value: round(totalSales), kind: "total" as const, note: "Net sales + shipping charges + return fees + taxes." },
  ]

  const breakdownChart = [
    { key: "net", label: "Net sales", value: round(Math.max(0, netSales)) },
    { key: "shipping", label: "Shipping charges", value: round(shippingCharges) },
    { key: "returnFees", label: "Return fees", value: returnFees },
    { key: "taxes", label: "Taxes", value: taxes },
  ]

  /* --------------------------- channels ---------------------------- */

  const channelSales = activeOrders.reduce((s, o) => s + o.total, 0)
  const salesByChannel =
    activeCount > 0
      ? [
          {
            channel: "Online Store",
            orders: activeCount,
            sales: round(channelSales),
            share: 100,
          },
        ]
      : []

  /* -------------------------- orders by city ----------------------- */

  const cityMap = new Map<string, { orders: number; sales: number }>()
  for (const o of activeOrders) {
    const key = (o.city || "Unknown").trim()
    const entry = cityMap.get(key) ?? { orders: 0, sales: 0 }
    entry.orders += 1
    entry.sales += o.total
    cityMap.set(key, entry)
  }
  const ordersByCity = [...cityMap.entries()]
    .map(([city, v]) => ({ city, orders: v.orders, sales: round(v.sales) }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10)

  /* ----------------------- product analytics ----------------------- */

  const salesByProduct = productRows.map((row) => {
    const units = Number(row.units)
    const gross = round(Number(row.gross))
    const stock = Number(row.stock ?? 0)
    const denom = units + stock
    const sellThrough = denom > 0 ? round(units / denom) : 0
    return {
      productId: row.product_id,
      name: row.product_name,
      image: row.image || null,
      units,
      gross,
      discounts: 0,
      net: gross,
      sellThrough,
    }
  })

  /* ------------------------- cohort analysis ----------------------- */

  const firstOrderMonthByPhone = new Map<string, string>()
  for (const o of allOrders) {
    const ph = normalizePhone(o.phone)
    if (!ph) continue
    const month = o.created_at.slice(0, 7)
    if (!firstOrderMonthByPhone.has(ph)) firstOrderMonthByPhone.set(ph, month)
  }

  const cohortByMonth = new Map<string, Set<string>>()
  for (const [ph, month] of firstOrderMonthByPhone) {
    let set = cohortByMonth.get(month)
    if (!set) {
      set = new Set()
      cohortByMonth.set(month, set)
    }
    set.add(ph)
  }

  const activeByMonth = new Map<string, Set<string>>()
  for (const o of allOrders) {
    const ph = normalizePhone(o.phone)
    if (!ph) continue
    const month = o.created_at.slice(0, 7)
    let set = activeByMonth.get(month)
    if (!set) {
      set = new Set()
      activeByMonth.set(month, set)
    }
    set.add(ph)
  }

  const months = [...cohortByMonth.keys()].sort()
  const monthIndex = new Map(months.map((m, i) => [m, i]))
  const cohorts = months.slice(-12).map((month) => {
    const cohortPhones = cohortByMonth.get(month)!
    const idx = monthIndex.get(month)!
    const last = months.length - 1
    const retention = []
    for (let offset = 0; idx + offset <= last; offset += 1) {
      const targetMonth = months[idx + offset]
      const buyers = activeByMonth.get(targetMonth)
      let count = 0
      if (buyers) {
        for (const ph of buyers) if (cohortPhones.has(ph)) count += 1
      }
      retention.push({ offset, pct: round((count / cohortPhones.size) * 100) })
    }
    const [yy, mm] = month.split("-")
    const label = new Date(Date.UTC(+yy, +mm - 1, 1)).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    return { month, label, size: cohortPhones.size, retention }
  })

  /* ----------------------- unsupported sources --------------------- */

  const noSessionsReason =
    "Session tracking is not set up on this store yet, so there is no session data to report."

  const dataSources = {
    sessions: { available: false, reason: noSessionsReason } as DataSourceFlag,
    conversion: {
      available: false,
      reason: "Conversion rate needs session data, which is not tracked yet.",
    } as DataSourceFlag,
    channels: {
      available: true,
      note: "Orders are not tagged with a sales channel, so all orders are attributed to the Online Store.",
    } as DataSourceFlag,
    devices: { available: false, reason: noSessionsReason } as DataSourceFlag,
    locations: { available: false, reason: noSessionsReason } as DataSourceFlag,
    landingPages: { available: false, reason: noSessionsReason } as DataSourceFlag,
    referrers: { available: false, reason: noSessionsReason } as DataSourceFlag,
    socialReferrers: { available: false, reason: noSessionsReason } as DataSourceFlag,
    pos: {
      available: false,
      reason: "Point of sale (POS) is not set up on this store.",
    } as DataSourceFlag,
  }

  return {
    range: {
      start: input.start,
      end: input.end,
      label: bounds.label,
    },
    generatedAt: new Date().toISOString(),
    totals: {
      grossSales: round(grossSales),
      discounts: round(discounts),
      salesReversals: round(salesReversals),
      netSales: round(netSales),
      shippingCharges: round(shippingCharges),
      returnFees: round(returnFees),
      taxes: round(taxes),
      totalSales: round(totalSales),
      orders: ordersCount,
      activeOrders: activeCount,
      fulfilled,
      aov,
      returningCustomers,
      allCustomers,
      returningShare,
    },
    salesOverTime,
    salesBreakdown,
    breakdownChart,
    salesByChannel,
    ordersByCity,
    aovOverTime,
    conversionOverTime: [],
    salesByProduct,
    cohorts,
    sessionsByCategory: [],
    dataSources,
  }
}
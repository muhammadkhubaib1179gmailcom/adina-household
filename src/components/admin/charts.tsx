"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

/* ---------------- width hook ---------------- */

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  return [ref, width] as const
}

/* ---------------- card shell ---------------- */

export function AnalyticsCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-2xl border border-line bg-[#fde8eb] shadow-sm", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            {title && <h3 className="font-semibold text-lagoon-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

/* ---------------- empty state ---------------- */

export function EmptyState({
  title = "No data for this date range",
  reason,
  compact,
}: {
  title?: string
  reason?: string
  compact?: boolean
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "py-8" : "py-14")}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream">
        <Inbox className="h-5 w-5 text-ink-soft" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {reason && <p className="mt-1 max-w-sm text-xs text-ink-soft">{reason}</p>}
    </div>
  )
}

/* ---------------- stat card (top metrics) ---------------- */

const statTone: Record<string, string> = {
  default: "text-coral-600 bg-coral-500/10",
  gold: "text-gold-dark bg-gold/10",
  green: "text-success bg-success/10",
  sky: "text-sky-dark bg-sky/10",
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
  loading,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  tone?: keyof typeof statTone
  loading?: boolean
}) {
  return (
    <div className="rounded-2xl border border-line bg-[#fde8eb] p-5 shadow-sm">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", statTone[tone])}>
        {icon}
      </div>
      <p className="text-xl font-bold leading-tight text-lagoon-900">
        {loading ? "…" : value}
      </p>
      <p className="mt-0.5 text-sm text-ink-soft">{label}</p>
      {sub && <p className="mt-1 text-xs text-coral-600">{sub}</p>}
    </div>
  )
}

/* ---------------- line chart ---------------- */

export interface LineSeries {
  key: string
  value: number
}

export function LineChart({
  data,
  formatValue = (v) => String(v),
  formatLabel,
  color = "#21a09c",
  height = 240,
}: {
  data: LineSeries[]
  formatValue?: (v: number) => string
  formatLabel?: (key: string, index: number) => string
  color?: string
  height?: number
}) {
  const [wrapRef, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const padLeft = 52
  const padRight = 14
  const padTop = 16
  const padBottom = 30

  const { line, area, points, yTicks, xTicks } = useMemo(() => {
    const plotW = Math.max(1, width - padLeft - padRight)
    const plotH = height - padTop - padBottom
    const n = data.length
    const values = data.map((d) => d.value)
    let min = values.length ? Math.min(...values) : 0
    let max = values.length ? Math.max(...values) : 0
    if (min === max) {
      max = min + 1
      min = min - 1
    }
    if (min > 0) min = 0

    const xAt = (i: number) => (n <= 1 ? padLeft + plotW / 2 : padLeft + (plotW * i) / (n - 1))
    const yAt = (v: number) => padTop + plotH - ((v - min) / (max - min)) * plotH

    const pts = data.map((d, i) => [xAt(i), yAt(d.value)] as const)

    const line = pts
      .map(
        ([x, y], i) =>
          `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ")

    const baseline = padTop + plotH
    const areaPath =
      n === 0
        ? ""
        : n === 1
          ? `M${pts[0][0].toFixed(1)},${baseline} L${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} L${(pts[0][0] + 1).toFixed(1)},${pts[0][1].toFixed(1)} L${(pts[0][0] + 1).toFixed(1)},${baseline} Z`
          : `M${pts[0][0].toFixed(1)},${baseline} ${line.slice(1)} L${pts[n - 1][0].toFixed(1)},${baseline} Z`

    const tickCount = 4
    const rawStep = (max - min) / tickCount
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(1, Math.abs(rawStep)))))
    const norm = rawStep / magnitude
    const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
    const step = niceNorm * magnitude
    const ticks: { v: number; y: number; label: string }[] = []
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
      ticks.push({ v: Math.round(v * 100) / 100, y: yAt(v), label: formatValue(Math.round(v)) })
    }
    if (ticks.length === 0) ticks.push({ v: 0, y: yAt(0), label: formatValue(0) })

    const labelEvery = Math.max(1, Math.ceil(n / 6))
    const xTicks = data.map((d, i) => ({ i, x: xAt(i) })).filter((_, i) => i % labelEvery === 0 || i === n - 1)

    return { line, area: areaPath, points: pts, yTicks: ticks, xTicks }
  }, [data, width, height, padLeft, padRight, padTop, padBottom, formatValue])

  if (data.length === 0) {
    return (
      <div ref={wrapRef}>
        <EmptyState compact />
      </div>
    )
  }

  const plotW = Math.max(1, width - padLeft - padRight)
  const plotH = height - padTop - padBottom
  const baseline = padTop + plotH

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (data.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const rel = Math.min(plotW, Math.max(0, x - padLeft))
    const ratio = plotW > 0 ? rel / plotW : 0
    const idx = Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))))
    setHover(idx)
  }

  const hoverD = hover !== null ? data[hover] : null

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      {width > 0 && (
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Analytics line chart"
        >
          <defs>
            <clipPath id={`clip-${color.replace("#", "")}`}>
              <rect x={padLeft} y={padTop} width={plotW} height={plotH} rx="6" />
            </clipPath>
          </defs>

          {yTicks.map((t) => (
            <g key={t.v}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={t.y}
                y2={t.y}
                stroke="#e8e4df"
                strokeDasharray={t.v === 0 ? "0" : "3 4"}
              />
              <text x={padLeft - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#6b5f5f">
                {t.label}
              </text>
            </g>
          ))}

          {xTicks.map((t) => (
            <text key={`x-${t.i}`} x={t.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#6b5f5f">
              {formatLabel ? formatLabel(data[t.i].key, t.i) : data[t.i].key}
            </text>
          ))}

          <g clipPath={`url(#clip-${color.replace("#", "")})`}>
            <path d={area} fill={color} opacity="0.1" />
            <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={hover === i ? 5 : 3.5}
                fill={hover === i ? "#ffffff" : color}
                stroke={color}
                strokeWidth="2"
              />
            ))}
          </g>

          <line x1={padLeft} x2={width - padRight} y1={baseline} y2={baseline} stroke="#c4a29e" />
        </svg>
      )}

      {hoverD && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-lagoon-900 px-3 py-2 text-white shadow-lg"
          style={{
            left: hover !== null ? padLeft + (plotW * hover) / Math.max(1, data.length - 1) : 0,
            top: Math.max(6, height - plotH - 46),
          }}
        >
          <p className="text-[11px] text-white/70">
            {formatLabel ? formatLabel(hoverD.key, hover ?? 0) : hoverD.key}
          </p>
          <p className="text-sm font-semibold">{formatValue(hoverD.value)}</p>
        </div>
      )}
    </div>
  )
}

/* ---------------- horizontal bar list ---------------- */

export function BarList({
  rows,
  formatValue = (v) => String(v),
  formatShare,
  color = "bg-coral-500",
  emptyReason,
}: {
  rows: { label: string; value: number; share?: number; sub?: string }[]
  formatValue?: (v: number) => string
  formatShare?: (share: number) => string
  color?: string
  emptyReason?: string
}) {
  if (rows.length === 0) return <EmptyState compact reason={emptyReason} />

  const max = Math.max(...rows.map((r) => r.value), 0) || 1

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const share = row.share ?? (max > 0 ? (row.value / max) * 100 : 0)
        return (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-medium text-ink">{row.label}</p>
              <div className="flex shrink-0 items-baseline gap-2 text-xs">
                {formatShare && share !== undefined && (
                  <span className="text-ink-soft">{formatShare(share)}</span>
                )}
                <span className="text-sm font-semibold text-lagoon-900">{formatValue(row.value)}</span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
              <div
                className={cn("h-full rounded-full", color)}
                style={{ width: `${Math.max(1, Math.min(100, share))}%` }}
              />
            </div>
            {row.sub && <p className="mt-1 text-xs text-ink-soft">{row.sub}</p>}
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- stacked bar (composition) ---------------- */

export function StackedBar({
  segments,
  formatValue = (v) => String(v),
}: {
  segments: { label: string; value: number; className?: string }[]
  formatValue?: (v: number) => string
}) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0)

  if (total <= 0) {
    return (
      <EmptyState
        compact
        title="No data for this date range"
        reason="There is no sales volume to break down for the selected period."
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex h-9 w-full overflow-hidden rounded-lg border border-line bg-cream">
        {segments.map(
          (seg) =>
            seg.value > 0 && (
              <div
                key={seg.label}
                className={cn("flex items-center justify-center text-[10px] font-semibold text-white", seg.className)}
                style={{ width: `${(seg.value / total) * 100}%` }}
                title={seg.label}
              >
                {seg.value / total >= 0.12 ? formatValue(seg.value) : ""}
              </div>
            ),
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-ink-soft">
              <span className={cn("h-2.5 w-2.5 rounded-sm", seg.className)} />
              {seg.label}
            </span>
            <span className="font-semibold text-lagoon-900">{formatValue(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- skeleton ---------------- */

export function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-line bg-[#fde8eb] p-5 shadow-sm">
            <div className="shimmer mb-3 h-9 w-9 rounded-xl" />
            <div className="shimmer mb-2 h-6 w-24 rounded" />
            <div className="shimmer h-3 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="shimmer h-72 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="shimmer h-64 rounded-2xl" />
        <div className="shimmer h-64 rounded-2xl" />
      </div>
    </div>
  )
}
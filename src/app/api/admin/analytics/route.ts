import { NextRequest, NextResponse } from "next/server"
import { getAnalyticsDashboard } from "@/lib/analytics"

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams
    const start = search.get("start") ?? ""
    const end = search.get("end") ?? ""
    const label = search.get("label") ?? undefined

    if (!start || !end) {
      return NextResponse.json(
        { error: "start and end query parameters are required (YYYY-MM-DD)" },
        { status: 400 },
      )
    }

    try {
      const data = getAnalyticsDashboard({ start, end, label })
      return NextResponse.json(data)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid date range" },
        { status: 400 },
      )
    }
  } catch (err) {
    console.error("GET /api/admin/analytics error:", err)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}
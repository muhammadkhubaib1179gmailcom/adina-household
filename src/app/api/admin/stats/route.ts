import { NextResponse } from "next/server"
import { getDashboardStats, listOrders } from "@/lib/db"

export async function GET() {
  try {
    const stats = getDashboardStats()
    const recentOrders = listOrders(undefined, 5)
    return NextResponse.json({ stats, recentOrders })
  } catch (err) {
    console.error("GET /api/admin/stats error:", err)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { listOrders, updateOrderStatus } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? undefined
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "100", 10)
    const orders = listOrders(status, limit)
    return NextResponse.json({ orders })
  } catch (err) {
    console.error("GET /api/admin/orders error:", err)
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json()
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 })
    }
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 })
    }
    const updated = updateOrderStatus(orderId, status)
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error("PATCH /api/admin/orders error:", err)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
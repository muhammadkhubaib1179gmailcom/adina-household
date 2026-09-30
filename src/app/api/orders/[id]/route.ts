import { NextResponse } from "next/server"
import { getOrder } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = getOrder(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    // Expose id + payment fields to the success page so an unpaid JazzCash
    // order can link back to "Pay now", and so the paid/unpaid banner renders.
    return NextResponse.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        full_name: order.full_name,
        city: order.city,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        payment_provider: order.payment_provider,
        transaction_id: order.transaction_id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
      },
    })
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err)
    return NextResponse.json({ error: "Failed to get order" }, { status: 500 })
  }
}
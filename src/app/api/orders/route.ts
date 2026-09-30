import { NextRequest, NextResponse } from "next/server"
import { createOrder, getOrder, listOrders, isDatabaseAvailable } from "@/lib/db"
import { sendNewOrderAlert } from "@/lib/notify"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, phone, email, city, address, province, paymentMethod, subtotal, deliveryCharge, total, notes, items } = body

    if (!fullName || !phone || !city || !address || !paymentMethod || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: "Order storage is not available in this environment." },
        { status: 503 },
      )
    }

    const order = createOrder({
      fullName,
      phone,
      email,
      city,
      address,
      province,
      paymentMethod,
      subtotal,
      deliveryCharge,
      total,
      notes,
      items,
    })

    // Fire WhatsApp + Gmail "new order" alerts. Non-blocking + fail-soft:
    // a notification problem must never prevent the customer's order itself.
    const withItems = getOrder(order.id)
    if (withItems) {
      const convert = {
        order_number: order.order_number,
        full_name: order.full_name,
        phone: order.phone,
        email: order.email,
        city: order.city,
        address: order.address,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        total: order.total,
        items: withItems.items.map((i) => ({
          productName: i.product_name,
          variantTitle: i.variant_title,
          quantity: i.quantity,
          price: i.price,
        })),
      }
      void sendNewOrderAlert(convert)
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error("POST /api/orders error:", err)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? undefined
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50", 10)
    const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0", 10)
    const orders = listOrders(status, limit, offset)
    return NextResponse.json({ orders })
  } catch (err) {
    console.error("GET /api/orders error:", err)
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 })
  }
}
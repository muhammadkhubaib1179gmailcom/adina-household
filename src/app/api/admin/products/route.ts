import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { listProductsFromDB, createProductFromDB } from "@/lib/dbAdminProducts"

export async function GET() {
  return NextResponse.json(listProductsFromDB())
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard) return guard
  const input = await req.json().catch(() => null)
  if (!input || typeof input.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  const id = createProductFromDB(input)
  return NextResponse.json({ id, ok: true }, { status: 201 })
}

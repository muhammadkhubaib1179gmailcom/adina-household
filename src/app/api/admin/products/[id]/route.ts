import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { updateProductFromDB, deleteProductFromDB } from "@/lib/dbAdminProducts"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdmin(req)
  if (guard) return guard
  const { id } = await ctx.params
  const input = await req.json().catch(() => null)
  if (!input) return NextResponse.json({ error: "invalid body" }, { status: 400 })
  const ok = updateProductFromDB(id, input)
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdmin(req)
  if (guard) return guard
  const { id } = await ctx.params
  const ok = deleteProductFromDB(id)
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}

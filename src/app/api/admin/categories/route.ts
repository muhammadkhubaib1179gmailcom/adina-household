import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { listCategoriesFromDB } from "@/lib/dbAdminProducts"

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard) return guard
  return NextResponse.json(listCategoriesFromDB())
}
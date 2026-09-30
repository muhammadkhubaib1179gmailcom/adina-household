import { NextRequest, NextResponse } from "next/server"
import { createAdminSession, passwordMatches, usernameMatches } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const username = typeof body?.username === "string" ? body.username : ""
    const password = typeof body?.password === "string" ? body.password : ""

    console.log("Login attempt - username:", username, "password length:", password.length)
    console.log("Username matches:", usernameMatches(username))
    console.log("Password matches:", passwordMatches(password))

    if (!usernameMatches(username) || !passwordMatches(password)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      )
    }

    await createAdminSession(password)
    console.log("Session created successfully")
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/admin/login error:", err)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, Eye, EyeOff } from "lucide-react"

const fieldClass =
  "w-full rounded-xl border-2 border-lagoon-100 bg-gradient-to-r from-emerald-100/60 via-white to-orange-100/60 py-3 pl-11 pr-4 text-sm font-medium text-ink placeholder:text-ink-soft/60 outline-none transition-all focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error ?? "Login failed")
        setLoading(false)
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-coral-50 via-white to-lagoon-100 px-6">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-3xl border border-lagoon-200/60 bg-[#fde8eb] shadow-2xl shadow-lagoon-900/15">
          <div className="h-1.5 bg-gradient-to-r from-coral-500 via-coral-400 to-lagoon-500" />
          <div className="p-8">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-coral-500 to-lagoon-500 text-white shadow-lg shadow-coral-500/30">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-orange-500">Admin Login</h1>
              <p className="mt-1.5 text-sm font-medium text-ink-soft">Welcome back — sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-wider text-lagoon-800">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lagoon-300" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-lagoon-800">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-lagoon-300" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    required
                    autoComplete="current-password"
                    className={`${fieldClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-lagoon-300 transition-colors hover:text-coral-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-coral-50 px-4 py-3 text-xs font-semibold text-coral-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-lagoon-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-coral-500/25 transition-transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-5 text-center text-xs font-medium text-ink-soft">
          Adina Household · Store Management
        </p>
      </div>
    </div>
  )
}
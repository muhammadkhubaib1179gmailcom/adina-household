import Link from "next/link"
import { redirect } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Package, ChartLine, LogOut, Home } from "lucide-react"
import { isAdminAuthed } from "@/lib/auth"
import { AdminParticlesBackground } from "@/components/admin/AdminParticlesBackground"

const nav = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/analytics", icon: ChartLine, label: "Analytics" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed()
  if (!authed) redirect("/admin/login")

  return (
    <div className="flex min-h-screen bg-[#f8e1dd]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col bg-gradient-to-b from-lagoon-900 via-lagoon-800 to-lagoon-700 text-white shadow-xl shadow-lagoon-900/20">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-lg font-extrabold tracking-tight text-white">Adina Admin</p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.2em] text-coral-300">Store Management</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-5 w-5 text-lagoon-300 transition-colors group-hover:text-coral-300" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-xl bg-coral-500/90 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-coral-600"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-white/40">Adina Household</p>
        </div>
      </aside>
      <main className="relative isolate ml-56 flex-1 overflow-hidden">
        <AdminParticlesBackground />
        <div className="relative z-10 min-h-screen p-8">{children}</div>
      </main>
    </div>
  )
}
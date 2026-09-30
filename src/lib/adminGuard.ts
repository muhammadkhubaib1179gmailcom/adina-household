import { redirect } from "next/navigation"
import { isAdminAuthed } from "@/lib/auth"

/**
 * Guard for admin PAGES (server components). Unlike a layout-level redirect,
 * this can be called inside each protected page, so the /admin/login page
 * itself never redirect-loops. Redirects to the login page when unauthed.
 */
export async function requireAdminPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login")
}

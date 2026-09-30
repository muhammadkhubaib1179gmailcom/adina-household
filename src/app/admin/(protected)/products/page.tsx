"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { Plus, Trash2, RefreshCw, Package, ImagePlus, Link2, Upload, X, Pencil, Check } from "lucide-react"

interface UiProduct {
  id: string
  name: string
  name_urdu?: string
  price: number
  sale_price: number | null
  stock: number
  featured: number
  badges?: string
  image?: string
  category_id?: string
  created_at?: string
}

interface UiCategory {
  id: string
  slug: string
  name: string
  nameUrdu: string
}

type ImageSource = "url" | "file"

const MAX_FILE_BYTES = 1.5 * 1024 * 1024

const inputClass =
  "w-full rounded-xl border-2 border-lagoon-100 bg-[#fde8eb] px-4 py-3 text-sm font-medium text-ink placeholder:text-ink-soft/60 outline-none transition-all focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10"
const labelClass =
  "mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-lagoon-800"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<UiProduct[]>([])
  const [categories, setCategories] = useState<UiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const [draftPrice, setDraftPrice] = useState("")
  const [draftStock, setDraftStock] = useState("")

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("10")
  const [categoryId, setCategoryId] = useState("")
  const [image, setImage] = useState("")
  const [imageSource, setImageSource] = useState<ImageSource>("url")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (showLoader: boolean) => {
    if (showLoader) setLoading(true)
    try {
      const res = await fetch("/api/admin/products")
      if (!res.ok) throw new Error("Failed to load")
      setProducts(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products")
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => load(true), [load])

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/products")
        if (!res.ok) throw new Error("Failed to load")
        setProducts((await res.json()) as UiProduct[])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load products")
      }
    })()
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((cats: UiCategory[]) => {
        setCategories(cats)
        if (cats.length > 0) setCategoryId(cats[0].id)
      })
      .catch(() => {})
  }, [])

  function clearForm() {
    setName("")
    setPrice("")
    setStock("10")
    setImage("")
    setImageSource("url")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleFilePicked(file: File | undefined) {
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPEG or PNG image file")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Image is too large — please keep it under 1.5 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result ?? ""))
    reader.onerror = () => setError("Could not read the selected image")
    reader.readAsDataURL(file)
  }

  async function addProduct() {
    setError("")
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0")
      return
    }
    if (Number(stock) < 0) {
      setError("Stock cannot be negative")
      return
    }
    if (!categoryId) {
      setError("Please pick a category")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nameUrdu: name.trim(),
          categoryId,
          price: Number(price) || 0,
          stock: Math.max(0, parseInt(stock) || 10),
          image,
          featured: true,
        }),
      })
      let data: { error?: string } = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) throw new Error(data.error || "Failed to add")
      clearForm()
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add item")
    } finally {
      setSaving(false)
    }
  }

  async function saveUpdates(id: string, patch: Partial<UiProduct> & { nameUrdu?: string }) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error("Update failed")
      setEditing(null)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed")
    }
  }

  async function removeProduct(id: string) {
    if (!confirm("Delete this item permanently?")) return
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    if (res.ok) await refresh()
  }

  function startEdit(p: UiProduct) {
    setEditing(p.id)
    setDraftName(p.name)
    setDraftPrice(String(p.price))
    setDraftStock(String(p.stock))
  }

  async function saveEdits(id: string) {
    setError("")
    if (!draftName.trim()) {
      setError("Name is required")
      return
    }
    if (Number(draftPrice) <= 0) {
      setError("Price must be greater than 0")
      return
    }
    if (Number(draftStock) < 0) {
      setError("Stock cannot be negative")
      return
    }
    await saveUpdates(id, {
      name: draftName.trim(),
      nameUrdu: draftName.trim(),
      price: Number(draftPrice),
      stock: Math.max(0, parseInt(draftStock) || 0),
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-orange-500">Products</h1>
          <p className="mt-1 font-medium text-ink-soft">Add new items, and update or remove existing stock from the store.</p>
          <div className="mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-coral-500 to-lagoon-500" />
        </div>
        <button onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-lagoon-200 bg-[#fde8eb] px-4 py-2.5 text-sm font-bold text-lagoon-700 transition-colors hover:bg-lagoon-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-600">{error}</p>}

      {/* Add a new item */}
      <section className="rounded-3xl border border-lagoon-200/60 bg-[#fde8eb] p-8 shadow-xl shadow-lagoon-900/5">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-coral-500 to-lagoon-500 text-white shadow-md shadow-coral-500/25">
            <Plus size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-lagoon-900">Add a new item</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Fields marked with <span className="text-coral-500">*</span> are required
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Name <span className="text-coral-500">*</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gulab Jamun (500g)"
              className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Price (RS) <span className="text-coral-500">*</span></span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="399" className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Stock <span className="text-coral-500">*</span></span>
            <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min={0} placeholder="10" className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Category <span className="text-coral-500">*</span></span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              {categories.length === 0 && <option value="">Select…</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-lagoon-200 bg-gradient-to-br from-coral-50/60 to-lagoon-50/60 p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lagoon-800">
            <ImagePlus size={14} /> Insert Image
            <span className="rounded-full bg-[#fde8eb] px-2 py-0.5 text-[10px] font-semibold normal-case text-coral-500 shadow-sm">optional</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => { setImageSource("url"); setImage(""); if (fileInputRef.current) fileInputRef.current.value = "" }}
              className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                imageSource === "url"
                  ? "border-coral-500 bg-coral-500 text-white shadow-md shadow-coral-500/25"
                  : "border-lagoon-200 bg-[#fde8eb] text-lagoon-800 hover:bg-lagoon-50"
              }`}
            >
              <Link2 size={14} /> Image URL
            </button>
            <button
              type="button"
              onClick={() => { setImageSource("file"); setImage("") }}
              className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                imageSource === "file"
                  ? "border-lagoon-500 bg-lagoon-500 text-white shadow-md shadow-lagoon-500/25"
                  : "border-lagoon-200 bg-[#fde8eb] text-lagoon-800 hover:bg-lagoon-50"
              }`}
            >
              <Upload size={14} /> Browse from this device
            </button>
          </div>

          <div className="mt-4">
            {imageSource === "url" ? (
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/product.jpg"
                className={inputClass}
              />
            ) : (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFilePicked(e.target.files?.[0])}
                className="w-full rounded-xl border-2 border-dashed border-lagoon-200 bg-[#fde8eb] px-4 py-8 text-sm font-medium text-ink-soft outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-coral-500 file:to-lagoon-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white focus:border-lagoon-400"
              />
            )}
          </div>

          {image && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-lagoon-100 bg-[#fde8eb] p-3 shadow-sm">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-lagoon-50">
                <Image src={image} alt="Preview" width={56} height={56} unoptimized className="h-full w-full object-cover" />
              </div>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-soft">
                {image.startsWith("data:") ? "Image selected from device" : image}
              </span>
              <button type="button" onClick={() => { setImage(""); if (fileInputRef.current) fileInputRef.current.value = "" }} title="Remove image"
                className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-coral-50 hover:text-coral-500">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <button onClick={addProduct} disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-coral-500 to-lagoon-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-coral-500/25 transition-transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60">
          <Plus size={16} /> {saving ? "Adding…" : "Add item"}
        </button>
      </section>

      {/* Inventory */}
      <section className="rounded-3xl border border-lagoon-200/60 bg-[#fde8eb] shadow-xl shadow-lagoon-900/5">
        <div className="flex items-center gap-4 border-b-2 border-lagoon-100 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lagoon-600 to-lagoon-400 text-white shadow-md shadow-lagoon-500/25">
            <Package size={18} />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-lagoon-900">Inventory ({products.length})</h2>
        </div>
        <div className="divide-y divide-lagoon-50">
          {loading && <div className="px-6 py-10 text-center text-sm font-medium text-ink-soft">Loading…</div>}
          {!loading && products.length === 0 && (
            <div className="px-6 py-10 text-center text-sm font-medium text-ink-soft">No items yet. Add your first product above.</div>
          )}
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-5 px-6 py-4 transition-colors hover:bg-lagoon-50/40">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-lagoon-50">
                {p.image ? (
                  <Image src={p.image} alt={p.name} width={56} height={56} className="h-full w-full object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-soft"><Package size={20} /></div>
                )}
              </div>

              {editing === p.id ? (
                <div className="min-w-0 flex-1">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-lagoon-800">Name</span>
                      <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Name"
                        className="w-full rounded-xl border-2 border-lagoon-100 bg-[#fde8eb] px-3.5 py-2.5 text-sm font-medium outline-none transition-all focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-lagoon-800">Price (RS)</span>
                      <input value={draftPrice} onChange={(e) => setDraftPrice(e.target.value)} type="number" placeholder="Price"
                        className="w-full rounded-xl border-2 border-lagoon-100 bg-[#fde8eb] px-3.5 py-2.5 text-sm font-medium outline-none transition-all focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-lagoon-800">Stock</span>
                      <input value={draftStock} onChange={(e) => setDraftStock(e.target.value)} type="number" min={0} placeholder="Stock"
                        className="w-full rounded-xl border-2 border-lagoon-100 bg-[#fde8eb] px-3.5 py-2.5 text-sm font-medium outline-none transition-all focus:border-coral-400 focus:ring-4 focus:ring-coral-500/10" />
                    </label>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => saveEdits(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-coral-500 to-lagoon-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-coral-500/20 transition-transform hover:scale-[1.02]">
                      <Check size={14} /> Save
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-lagoon-100 px-4 py-2 text-xs font-bold text-lagoon-800 transition-colors hover:bg-lagoon-50">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                    {p.sale_price != null ? (
                      <p className="text-xs font-medium text-ink-soft"><s>RS {Number(p.price).toLocaleString()}</s> <span className="font-bold text-coral-500">RS {Number(p.sale_price).toLocaleString()}</span></p>
                    ) : (
                      <p className="text-xs font-medium text-ink-soft">RS {Number(p.price).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1.5 rounded-lg bg-coral-50 px-3 py-1.5 text-xs font-bold text-coral-600 transition-colors hover:bg-coral-100">
                      <Pencil size={12} /> Edit
                    </button>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${Number(p.stock) > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {Number(p.stock) > 0 ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </>
              )}

              <button onClick={() => removeProduct(p.id)} title="Delete item"
                className="rounded-xl p-2.5 text-ink-soft transition-colors hover:bg-coral-50 hover:text-coral-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
import { DatabaseSync } from "node:sqlite"
import path from "path"

const DB_PATH = path.join(process.cwd(), "adina.db")

let db: DatabaseSync

function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH)
    db.exec("PRAGMA journal_mode = WAL")
    db.exec("PRAGMA foreign_keys = ON")
  }
  return db
}

function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export interface AdminVariantInput {
  id?: string
  title: string
  titleUrdu: string
  price: number
  stock?: number
  image?: string
}

export interface AdminProductInput {
  id?: string
  name: string
  nameUrdu: string
  description?: string
  descriptionUrdu?: string
  image?: string
  videoUrl?: string
  price?: number
  salePrice?: number
  stock?: number
  featured?: boolean
  badges?: string
  categoryId: string
  variants?: AdminVariantInput[]
}

export function listCategoriesFromDB() {
  return getDb()
    .prepare(`SELECT id, slug, name, name_urdu as nameUrdu FROM categories ORDER BY name`)
    .all() as { id: string; slug: string; name: string; nameUrdu: string }[]
}

export function createProductFromDB(input: AdminProductInput): string {
  const database = getDb()
  const id = input.id || newId()
  const slug = `${slugify(input.name)}-${id.slice(0, 6)}`

  database
    .prepare(`
      INSERT INTO products (
        id, slug, name, name_urdu, description, description_urdu,
        image, video_url, price, sale_price, stock, featured, badges, category_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      slug,
      input.name,
      input.nameUrdu,
      input.description ?? "",
      input.descriptionUrdu ?? "",
      input.image ?? "",
      input.videoUrl ?? "",
      input.price ?? 0,
      input.salePrice ?? null,
      input.stock ?? 10,
      input.featured ? 1 : 0,
      input.badges ?? "",
      input.categoryId,
    )

  insertVariants(database, id, input.variants)
  return id
}

export function updateProductFromDB(id: string, input: AdminProductInput): boolean {
  const database = getDb()
  const existing = database.prepare("SELECT id FROM products WHERE id = ?").get(id)
  if (!existing) return false

  const cols: Record<string, unknown> = {}
  if (input.name !== undefined) cols.name = input.name
  if (input.nameUrdu !== undefined) cols.name_urdu = input.nameUrdu
  if (input.description !== undefined) cols.description = input.description
  if (input.descriptionUrdu !== undefined) cols.description_urdu = input.descriptionUrdu
  if (input.image !== undefined) cols.image = input.image
  if (input.videoUrl !== undefined) cols.video_url = input.videoUrl
  if (input.price !== undefined) cols.price = input.price
  if (input.salePrice !== undefined) cols.sale_price = input.salePrice
  if (input.stock !== undefined) cols.stock = input.stock
  if (input.featured !== undefined) cols.featured = input.featured ? 1 : 0
  if (input.badges !== undefined) cols.badges = input.badges
  if (input.categoryId !== undefined) cols.category_id = input.categoryId

  const names = Object.keys(cols)
  if (names.length > 0) {
    const setClause = names.map((k) => `${k} = ?`).join(", ")
    const values = names.map((k) => cols[k] as string | number | bigint | null)
    database.prepare(`UPDATE products SET ${setClause} WHERE id = ?`).run(...values, id)
  }

  if (input.variants !== undefined) {
    database.prepare("DELETE FROM product_variants WHERE product_id = ?").run(id)
    insertVariants(database, id, input.variants)
  }
  return true
}

export function deleteProductFromDB(id: string): boolean {
  const database = getDb()
  const existing = database.prepare("SELECT id FROM products WHERE id = ?").get(id)
  if (!existing) return false
  database.prepare("DELETE FROM product_variants WHERE product_id = ?").run(id)
  database.prepare("DELETE FROM products WHERE id = ?").run(id)
  return true
}

export function setFeaturedFromDB(id: string, featured: boolean): boolean {
  const database = getDb()
  const existing = database.prepare("SELECT id FROM products WHERE id = ?").get(id)
  if (!existing) return false
  database.prepare("UPDATE products SET featured = ? WHERE id = ?").run(featured ? 1 : 0, id)
  return true
}

function insertVariants(database: DatabaseSync, productId: string, variants: AdminVariantInput[] = []) {
  const insert = database.prepare(`
    INSERT INTO product_variants (id, product_id, title, title_urdu, price, stock, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  for (const v of variants) {
    insert.run(newId(), productId, v.title, v.titleUrdu, v.price ?? 0, v.stock ?? 10, v.image ?? "")
  }
}

export function listProductsFromDB(): Record<string, unknown>[] {
  const database = getDb()
  return database.prepare(`
    SELECT id, slug, name, name_urdu as name_urdu, description, description_urdu as description_urdu,
           image, video_url as video_url, price, sale_price as sale_price, stock, featured, badges,
           category_id as category_id, created_at as created_at
    FROM products ORDER BY created_at DESC
  `).all()
}

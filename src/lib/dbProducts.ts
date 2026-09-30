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

export function getProductsFromDB() {
  const database = getDb()
  const products = database.prepare(`
    SELECT 
      p.*,
      c.name as category_name,
      c.name_urdu as category_name_urdu,
      c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `).all() as any[]

  return products.map((p: any) => {
    const variants = database.prepare(`
      SELECT * FROM product_variants WHERE product_id = ?
    `).all(p.id) as any[]

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      nameUrdu: p.name_urdu,
      category: p.category_slug,
      categoryUrdu: p.category_name_urdu,
      description: p.description,
      descriptionUrdu: p.description_urdu,
      images: [p.image],
      videoUrl: p.video_url || undefined,
      basePrice: p.price,
      featured: p.featured === 1,
      soldOut: p.stock === 0,
      variants: variants.map((v: any) => ({
        id: v.id,
        name: v.title,
        nameUrdu: v.title_urdu,
        sku: `SKU-${v.id.substring(0, 8)}`,
        price: v.price,
        stock: v.stock,
        size: undefined,
      })),
    }
  })
}

export function getProductBySlugFromDB(slug: string) {
  const products = getProductsFromDB()
  return products.find((p: any) => p.slug === slug)
}

export function getProductsByCategoryFromDB(categorySlug: string) {
  const products = getProductsFromDB()
  return products.filter((p: any) => p.category === categorySlug)
}

export function getFeaturedProductsFromDB() {
  const products = getProductsFromDB()
  return products.filter((p: any) => p.featured)
}

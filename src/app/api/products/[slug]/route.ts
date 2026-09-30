import { NextResponse } from 'next/server'
import { DatabaseSync } from 'node:sqlite'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'adina.db')

function getDb() {
  const db = new DatabaseSync(DB_PATH)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  return db
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = getDb()
    
    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.name_urdu as category_name_urdu,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `).get(slug) as any

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const variants = db.prepare(`
      SELECT * FROM product_variants WHERE product_id = ?
    `).all(product.id) as any[]

    const result = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      nameUrdu: product.name_urdu,
      category: product.category_slug,
      categoryUrdu: product.category_name_urdu,
      description: product.description,
      descriptionUrdu: product.description_urdu,
      images: [product.image],
      videoUrl: product.video_url || undefined,
      basePrice: product.price,
      featured: product.featured === 1,
      soldOut: product.stock === 0,
      variants: variants.map((v: any) => ({
        id: v.id,
        name: v.title,
        nameUrdu: v.title_urdu,
        sku: `SKU-${v.id.substring(0, 8)}`,
        price: v.price,
        stock: v.stock,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

import { DatabaseSync } from "node:sqlite"
import path from "path"

const DB_PATH = path.join(process.cwd(), "adina.db")

let db: DatabaseSync

function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH)
    db.exec("PRAGMA journal_mode = WAL")
    db.exec("PRAGMA foreign_keys = ON")
    seedDb(db)
  }
  return db
}

function ensureColumn(database: DatabaseSync, table: string, column: string, definition: string) {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  if (!cols.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

function runMigrations(database: DatabaseSync) {
  // Payment tracking: online gateway state lives on the order itself
  ensureColumn(database, "orders", "payment_status", "TEXT NOT NULL DEFAULT 'unpaid'")
  ensureColumn(database, "orders", "payment_provider", "TEXT")
  ensureColumn(database, "orders", "transaction_id", "TEXT")
  ensureColumn(database, "orders", "payment_details", "TEXT")
}

function seedDb(database: DatabaseSync) {
  runMigrations(database)
  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      province TEXT,
      payment_method TEXT NOT NULL,
      subtotal REAL NOT NULL,
      delivery_charge REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_name_urdu TEXT NOT NULL,
      variant_title TEXT NOT NULL,
      variant_title_urdu TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `)
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20)
}

function generateOrderNumber(): string {
  const seq = getDb().prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }
  return `ADH-${String(seq.c + 1).padStart(5, "0")}`
}

export interface CreateOrderInput {
  fullName: string
  phone: string
  email?: string
  city: string
  address: string
  province?: string
  paymentMethod: string
  paymentStatus?: string
  paymentProvider?: string
  transactionId?: string
  subtotal: number
  deliveryCharge: number
  total: number
  notes?: string
  items: {
    productId: string
    productName: string
    productNameUrdu: string
    variantTitle: string
    variantTitleUrdu: string
    price: number
    quantity: number
    image?: string
    variantId?: string
  }[]
}

export interface OrderRecord {
  id: string
  order_number: string
  full_name: string
  phone: string
  email: string | null
  city: string
  address: string
  province: string | null
  payment_method: string
  payment_status: string
  payment_provider: string | null
  transaction_id: string | null
  payment_details: string | null
  subtotal: number
  delivery_charge: number
  total: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRecord {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_name_urdu: string
  variant_title: string
  variant_title_urdu: string
  price: number
  quantity: number
  image: string | null
}

export function createOrder(input: CreateOrderInput): OrderRecord {
  const database = getDb()
  const id = generateId()
  const orderNumber = generateOrderNumber()

  database.prepare(`
    INSERT INTO orders (id, order_number, full_name, phone, email, city, address, province, payment_method, payment_status, payment_provider, transaction_id, payment_details, subtotal, delivery_charge, total, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    orderNumber,
    input.fullName,
    input.phone,
    input.email ?? null,
    input.city,
    input.address,
    input.province ?? null,
    input.paymentMethod,
    input.paymentStatus ?? "unpaid",
    input.paymentProvider ?? null,
    input.transactionId ?? null,
    null,
    input.subtotal,
    input.deliveryCharge,
    input.total,
    input.notes ?? null,
  )

  const insertItem = database.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_name, product_name_urdu, variant_title, variant_title_urdu, price, quantity, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const decrementProduct = database.prepare(
    "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?"
  )
  const decrementVariant = database.prepare(
    "UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?"
  )

  for (const item of input.items) {
    insertItem.run(
      generateId(),
      id,
      item.productId,
      item.productName,
      item.productNameUrdu,
      item.variantTitle,
      item.variantTitleUrdu,
      item.price,
      item.quantity,
      item.image ?? null,
    )
    decrementProduct.run(item.quantity, item.productId)
    if (item.variantId) decrementVariant.run(item.quantity, item.variantId)
  }

  return database.prepare("SELECT * FROM orders WHERE id = ?").get(id) as unknown as OrderRecord
}

export function getOrder(idOrNumber: string): (OrderRecord & { items: OrderItemRecord[] }) | null {
  const database = getDb()
  const order = database.prepare(
    "SELECT * FROM orders WHERE id = ? OR order_number = ?"
  ).get(idOrNumber, idOrNumber) as unknown as OrderRecord | undefined

  if (!order) return null

  const items = database.prepare(
    "SELECT * FROM order_items WHERE order_id = ?"
  ).all(order.id) as unknown as OrderItemRecord[]

  return { ...order, items }
}

export function listOrders(status?: string, limit = 50, offset = 0): OrderRecord[] {
  const database = getDb()
  if (status) {
    return database.prepare(
      "SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).all(status, limit, offset) as unknown as OrderRecord[]
  }
  return database.prepare(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(limit, offset) as unknown as OrderRecord[]
}

export function updateOrderStatus(orderId: string, status: string): OrderRecord | null {
  const database = getDb()
  database.prepare(
    "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, orderId)
  return (database.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as unknown as OrderRecord) ?? null
}

export interface PaymentUpdate {
  paymentStatus?: string
  paymentProvider?: string
  transactionId?: string
  paymentDetails?: string
}

export function updateOrderPayment(
  orderId: string,
  update: PaymentUpdate
): (OrderRecord & { items: OrderItemRecord[] }) | null {
  const database = getDb()
  const fields: string[] = []
  const values: (string | number | null)[] = []
  if (update.paymentStatus !== undefined) {
    fields.push("payment_status = ?")
    values.push(update.paymentStatus)
  }
  if (update.paymentProvider !== undefined) {
    fields.push("payment_provider = ?")
    values.push(update.paymentProvider)
  }
  if (update.transactionId !== undefined) {
    fields.push("transaction_id = ?")
    values.push(update.transactionId)
  }
  if (update.paymentDetails !== undefined) {
    fields.push("payment_details = ?")
    values.push(update.paymentDetails)
  }
  if (fields.length === 0) return getOrder(orderId)
  fields.push("updated_at = datetime('now')")
  database.prepare(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`).run(...values, orderId)
  return getOrder(orderId)
}

export function getDashboardStats() {
  const database = getDb()
  const total = (database.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c
  const pending = (database.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get() as { c: number }).c
  const confirmed = (database.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'confirmed'").get() as { c: number }).c
  const shipped = (database.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'shipped'").get() as { c: number }).c
  const delivered = (database.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'").get() as { c: number }).c
  const revenue = (database.prepare("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')").get() as { s: number }).s
  return { total, pending, confirmed, shipped, delivered, revenue }
}

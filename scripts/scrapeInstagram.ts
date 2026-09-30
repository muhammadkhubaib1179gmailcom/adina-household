import { ApifyClient } from 'apify-client';
import { DatabaseSync } from 'node:sqlite';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const DB_PATH = path.join(process.cwd(), 'adina.db');

interface InstagramPost {
  caption?: string;
  displayUrl: string;
  videoUrl?: string;
  timestamp: string;
  likesCount?: number;
  commentsCount?: number;
  id: string;
}

interface ScrapedProduct {
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  price: number;
  images: string[];
  videos: string[];
  category: string;
  slug: string;
}

const APIFY_API_KEY = process.env.APIFY_API_KEY || '';
const INSTAGRAM_URL = 'https://www.instagram.com/adina.household';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

function extractPriceFromText(text: string): number | null {
  const pricePatterns = [
    /PKR\s*(\d+[,\d]*)/i,
    /Rs\.?\s*(\d+[,\d]*)/i,
    /₨\s*(\d+[,\d]*)/,
    /(\d+[,\d]*)\s*PKR/i,
    /(\d+[,\d]*)\s*Rs/i,
    /Price[:\s]*(\d+[,\d]*)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const price = parseInt(match[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  return null;
}

function categorizeProduct(caption: string): string {
  const lowercaseCaption = caption.toLowerCase();
  
  if (lowercaseCaption.includes('cup') && lowercaseCaption.includes('saucer')) {
    return 'cup-saucer-sets';
  }
  if (lowercaseCaption.includes('mug') || lowercaseCaption.includes('tumbler') || lowercaseCaption.includes('glass')) {
    return 'drinkware';
  }
  if (lowercaseCaption.includes('plate') || lowercaseCaption.includes('bowl')) {
    return 'ceramics';
  }
  if (lowercaseCaption.includes('storage') || lowercaseCaption.includes('jar')) {
    return 'storage';
  }
  if (lowercaseCaption.includes('danny home')) {
    return 'danny-home';
  }
  if (lowercaseCaption.includes('spoon') || lowercaseCaption.includes('cutlery')) {
    return 'tableware';
  }
  
  return 'ceramics';
}

async function scrapeInstagramPosts(): Promise<InstagramPost[]> {
  const client = new ApifyClient({
    token: APIFY_API_KEY,
  });

  console.log('🔍 Starting Instagram scraper...');

  const input = {
    directUrls: [INSTAGRAM_URL],
    resultsType: 'posts',
    resultsLimit: 100,
    searchType: 'hashtag',
    searchLimit: 1,
    addParentData: false,
  };

  try {
    const run = await client.actor('apify/instagram-scraper').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const posts = items as unknown as InstagramPost[];
    
    console.log(`✅ Scraped ${posts.length} posts from Instagram`);
    console.log(`📹 Found ${posts.filter((p: InstagramPost) => p.videoUrl).length} posts with videos`);
    return posts;
  } catch (error) {
    console.error('❌ Error scraping Instagram:', error);
    throw error;
  }
}

function cleanProductName(caption: string): string {
  const lines = caption.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const cleaned = line
      .replace(/\[.*?\]/g, '')
      .replace(/#\w+/g, '')
      .replace(/[❤️✨🎁🔥💫🌟⭐]/g, '')
      .replace(/PKR\s*\d+[,\d]*/gi, '')
      .replace(/Rs\.?\s*\d+[,\d]*/gi, '')
      .replace(/₨\s*\d+[,\d]*/g, '')
      .replace(/\d+[,\d]*\s*PKR/gi, '')
      .replace(/\d+[,\d]*\s*Rs/gi, '')
      .replace(/price:\s*\d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleaned && cleaned.length > 10 && !cleaned.toLowerCase().includes('giveaway')) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  
  return 'Untitled Product';
}

function cleanDescription(caption: string): string {
  return caption
    .replace(/\[.*?\]/g, '')
    .replace(/#\w+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}

function parseProductFromPost(post: InstagramPost): ScrapedProduct | null {
  if (!post.caption) {
    return null;
  }

  const caption = post.caption;
  
  if (caption.toLowerCase().includes('giveaway')) {
    return null;
  }
  
  const price = extractPriceFromText(caption);
  
  if (!price || price < 100) {
    return null;
  }

  const name = cleanProductName(caption);
  const description = cleanDescription(caption);
  
  const category = categorizeProduct(caption);
  const slug = generateSlug(name);

  const images = [post.displayUrl];
  const videos = post.videoUrl ? [post.videoUrl] : [];

  return {
    name,
    nameUrdu: name,
    description,
    descriptionUrdu: description,
    price,
    images,
    videos,
    category,
    slug,
  };
}

function initDatabase(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_urdu TEXT NOT NULL,
      image TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_urdu TEXT NOT NULL,
      description TEXT NOT NULL,
      description_urdu TEXT NOT NULL,
      image TEXT NOT NULL,
      price REAL NOT NULL,
      sale_price REAL,
      stock INTEGER DEFAULT 10,
      featured INTEGER DEFAULT 0,
      badges TEXT DEFAULT '',
      category_id TEXT NOT NULL REFERENCES categories(id),
      video_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      title_urdu TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 10,
      image TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  `);

  return db;
}

async function addProductToDatabase(db: DatabaseSync, product: ScrapedProduct) {
  try {
    const categoryNames: Record<string, { name: string; nameUrdu: string }> = {
      'ceramics': { name: 'Ceramics', nameUrdu: 'سیرامکس' },
      'cup-saucer-sets': { name: 'Cup & Saucer Sets', nameUrdu: 'کپ اور تشتری سیٹ' },
      'drinkware': { name: 'Drinkware', nameUrdu: 'پینے کے برتن' },
      'tableware': { name: 'Tableware', nameUrdu: 'ٹیبل ویئر' },
      'storage': { name: 'Storage Jars', nameUrdu: 'ذخیرہ کرنے کے برتن' },
      'danny-home': { name: 'Danny Home', nameUrdu: 'ڈینی ہوم' },
    };

    let category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(product.category) as any;

    if (!category) {
      const catInfo = categoryNames[product.category] || { name: 'Other', nameUrdu: 'دیگر' };
      const categoryId = generateId();
      
      db.prepare(`
        INSERT INTO categories (id, slug, name, name_urdu, image)
        VALUES (?, ?, ?, ?, ?)
      `).run(categoryId, product.category, catInfo.name, catInfo.nameUrdu, product.images[0] || '');
      
      category = { id: categoryId };
      console.log(`✅ Created category: ${catInfo.name}`);
    }

    const existingProduct = db.prepare('SELECT * FROM products WHERE slug = ?').get(product.slug) as any;

    if (existingProduct) {
      if (product.videos.length > 0 && !existingProduct.video_url) {
        db.prepare('UPDATE products SET video_url = ? WHERE id = ?').run(
          product.videos[0],
          existingProduct.id
        );
        console.log(`📹 Added video to existing product: ${product.name}`);
        return { existing: true, videoAdded: true };
      } else {
        console.log(`⚠️  Product already exists: ${product.name}`);
      }
      return { existing: true, videoAdded: false };
    }

    const productId = generateId();
    
    db.prepare(`
      INSERT INTO products (id, slug, name, name_urdu, description, description_urdu, image, price, category_id, stock, featured, badges, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      product.slug,
      product.name,
      product.nameUrdu,
      product.description,
      product.descriptionUrdu,
      product.images[0] || '',
      product.price,
      category.id,
      10,
      0,
      '',
      product.videos[0] || null
    );

    db.prepare(`
      INSERT INTO product_variants (id, product_id, title, title_urdu, price, stock, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      productId,
      'Standard',
      'معیاری',
      product.price,
      10,
      product.images[0]
    );

    console.log(`✅ Added new product: ${product.name}`);
    return { existing: false };
  } catch (error) {
    console.error(`❌ Error adding product ${product.name}:`, error);
    throw error;
  }
}

async function main() {
  if (!APIFY_API_KEY) {
    console.error('❌ APIFY_API_KEY not found in environment variables');
    console.log('Please add APIFY_API_KEY to your .env file');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting Instagram product scraper for Adina Household\n');
    
    const posts = await scrapeInstagramPosts();
    
    const products: ScrapedProduct[] = [];
    for (const post of posts) {
      const product = parseProductFromPost(post);
      if (product) {
        products.push(product);
      }
    }

    console.log(`\n📦 Found ${products.length} products to process\n`);

    fs.writeFileSync(
      path.join(process.cwd(), 'scraped-products.json'),
      JSON.stringify(products, null, 2)
    );

    console.log('💾 Adding products to database...\n');
    
    const db = initDatabase();
    let addedCount = 0;
    let existingCount = 0;
    let videoCount = 0;

    for (const product of products) {
      try {
        const result = await addProductToDatabase(db, product);
        if (result.existing) {
          existingCount++;
          if ((result as any).videoAdded) videoCount++;
        } else {
          addedCount++;
          if (product.videos.length > 0) videoCount++;
        }
      } catch (error) {
        console.error(`Failed to add product: ${product.name}`, error);
      }
    }

    console.log('\n✨ Scraping complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Total posts scraped: ${posts.length}`);
    console.log(`   - Products identified: ${products.length}`);
    console.log(`   - New products added: ${addedCount}`);
    console.log(`   - Existing products: ${existingCount}`);
    console.log(`   - Videos added: ${videoCount}`);
    console.log(`\n📄 Full data saved to scraped-products.json`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

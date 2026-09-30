export interface Variant {
  id: string
  name: string
  nameUrdu: string
  sku: string
  price: number
  stock: number
  size?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  nameUrdu: string
  category: string
  categoryUrdu: string
  description: string
  descriptionUrdu: string
  images: string[]
  videoUrl?: string
  basePrice: number
  featured?: boolean
  soldOut?: boolean
  variants: Variant[]
}

const CDN = "https://cdn.shopify.com/s/files/1/0980/0469/7401/files"
const img = (file: string, v: string) => `${CDN}/${file}?v=${v}&width=900`

export const categories = [
  {
    slug: "ceramics",
    name: "Ceramics",
    nameUrdu: "سیرامکس",
    image: img("15208D52-D77A-48EF-AA0E-6AD391D60B86.jpg", "1775071429"),
  },
  {
    slug: "cup-saucer-sets",
    name: "Cup & Saucer Sets",
    nameUrdu: "کپ اور تشتری سیٹ",
    image: img("CC18F906-0B57-4591-A120-128BEF19F1FA.png", "1775060906"),
  },
  {
    slug: "drinkware",
    name: "Drinkware",
    nameUrdu: "پینے کے برتن",
    image: img("38DE2863-EEDC-439B-9204-2A7592F80562_57ff51ea-5d6a-4440-b0ba-1c292035d274.jpg", "1771721888"),
  },
  {
    slug: "tableware",
    name: "Tableware",
    nameUrdu: "ٹیبل ویئر",
    image: img("D0F9499E-15A6-465E-A649-75CD6646C732.jpg", "1771720939"),
  },
  {
    slug: "storage",
    name: "Storage Jars",
    nameUrdu: "ذخیرہ کرنے کے برتن",
    image: img("E8DD2FE4-1B2C-44B5-B624-19FA511A9331.jpg", "1775126052"),
  },
  {
    slug: "danny-home",
    name: "Danny Home",
    nameUrdu: "ڈینی ہوم",
    image: img("EE258C8D-7520-4FBF-A193-C92A978987FF.jpg", "1775123121"),
  },
]

export const products: Product[] = [
  {
    id: "p1",
    slug: "persian-heritage-cup-saucer-set-of-6",
    name: "Heritage Ornate Tile Design Cup And Saucer Set Of 6",
    nameUrdu: "ہیریٹیج آرنیٹ ٹائل ڈیزائن کپ اور تشتری سیٹ",
    category: "ceramics",
    categoryUrdu: "سیرامکس",
    description:
      "Experience the elegance of tradition with our Ornate Tile Design Heritage Cup and Saucer Set of 6. Crafted with exquisite detail, each porcelain cup features a beautifully hand-painted tile-inspired motif that blends classic heritage patterns with modern artistry. The cups are paired with matching saucers, both rimmed in fine gold accents that add a luxurious touch to every tea time.",
    descriptionUrdu:
      "ہمارے آرنیٹ ٹائل ڈیزائن ہیریٹیج کپ اور تشتری سیٹ کے ساتھ روایت کی خوبصورتی کا تجربہ کریں۔ نہایت باریک تفصیل کے ساتھ تیار کردہ ہر چینی مٹی کا کپ خوبصورت ہاتھ سے پینٹ شدہ ٹائل سے متاثر ڈیزائن پر مشتمل ہے جو کلاسیکی ورثے کے نمونوں کو جدید فن کے ساتھ ملاتا ہے۔ کپ مماثل تشتریوں کے ساتھ آتے ہیں، جن کے کناروں پر باریک سونے کی جھلکیاں چائے کے ہر وقت میں عیش و آرام کا اضافہ کرتی ہیں۔",
    images: [
      img("CC18F906-0B57-4591-A120-128BEF19F1FA.png", "1775060906"),
      img("BEE1D1FE-8849-4C59-8457-8EA2F370C721.png", "1775061008"),
      img("138CBB3F-77CB-4B78-992A-D003CA12C687.png", "1775061041"),
      img("C997428B-ACF0-4CC4-AB90-09B8129C3EC0.png", "1775061079"),
    ],
    basePrice: 6000,
    featured: true,
    variants: [
      { id: "v1", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-ORT-6-250", price: 6000, stock: 15, size: "250ml" },
    ],
  },
  {
    id: "p2",
    slug: "persian-heritage-cup-saucer-set-of-7",
    name: "Heritage Persian Classical Cup And Saucer Set Of 6",
    nameUrdu: "ہیریٹیج فارسی کلاسیکل کپ اور تشتری سیٹ",
    category: "cup-saucer-sets",
    categoryUrdu: "کپ اور تشتری سیٹ",
    description:
      "A classical Persian heritage design, beautifully hand-painted on premium porcelain. This cup and saucer set of 6 brings the timeless elegance of Persian art to your tea table with intricate detailing and a refined finish.",
    descriptionUrdu:
      "ایک کلاسیکل فارسی ہیریٹیج ڈیزائن، پریمیم چینی مٹی پر خوبصورتی سے ہاتھ سے پینٹ کیا گیا۔ یہ کپ اور تشتری سیٹ آپ کی چائے کی میز پر فارسی فن کی لازوال خوبصورتی لاتا ہے، نازک تفصیلات اور عمدہ تکمیل کے ساتھ۔",
    images: [
      img("D31A68E1-8707-4849-BC10-D092BE910E90.jpg", "1775061361"),
    ],
    basePrice: 6000,
    featured: true,
    variants: [
      { id: "v2", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-PER-6-250", price: 6000, stock: 12, size: "250ml" },
    ],
  },
  {
    id: "p3",
    slug: "heritage-tulip-carnation-6-piece-tea-set",
    name: "Heritage Floral Medallion Cup And Saucer Set Of 6",
    nameUrdu: "ہیریٹیج پھول میڈلین کپ اور تشتری سیٹ",
    category: "cup-saucer-sets",
    categoryUrdu: "کپ اور تشتری سیٹ",
    description:
      "Beautiful floral medallion patterns hand-painted around each cup and saucer in this heritage set of 6. A perfect blend of tulip and carnation motifs creates a romantic, garden-inspired tea set that will delight any tea lover.",
    descriptionUrdu:
      "اس ہیریٹیج سیٹ کے ہر کپ اور تشتری پر خوبصورت پھول میڈلین پیٹرن ہاتھ سے پینٹ کیے گئے ہیں۔ ٹیولپ اور کارنیشن نقشوں کا بہترین امتزاج ایک رومانوی، باغ سے متاثر چائے سیٹ تخلیق کرتا ہے جو ہر چائے سے محبت کرنے والوں کو خوش کرے گا۔",
    images: [
      img("05EE9BCD-A657-4BAE-81A5-285F3C864E3A.jpg", "1775061606"),
    ],
    basePrice: 6000,
    featured: true,
    variants: [
      { id: "v3", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-FLO-6-250", price: 6000, stock: 10, size: "250ml" },
    ],
  },
  {
    id: "p4",
    slug: "elegant-safavid-pattern-cup-set-of-six",
    name: "Heritage Safavid Legacy Cup And Saucer Set Of 6",
    nameUrdu: "ہیریٹیج صفوی ورثہ کپ اور تشتری سیٹ",
    category: "cup-saucer-sets",
    categoryUrdu: "کپ اور تشتری سیٹ",
    description:
      "Inspired by the golden age of Safavid art, this cup and saucer set features intricate Islamic geometric patterns and arabesque detailing on fine porcelain, finished with delicate gold accents.",
    descriptionUrdu:
      "صفوی فن کے سنہری دور سے متاثر، اس کپ اور تشتری سیٹ میں نفیس اسلامی ہندسی نمونے اور عربیسک تفصیلات نہایت باریک چینی مٹی پر نقوش کی گئی ہیں، جن پر نازک سونے کی جھلکیاں ہیں۔",
    images: [
      img("F5B4B1AC-E848-401D-8D1A-2BA42A7DC6FA.jpg", "1775061870"),
    ],
    basePrice: 6000,
    variants: [
      { id: "v4", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-SAF-6-250", price: 6000, stock: 8, size: "250ml" },
    ],
  },
  {
    id: "p5",
    slug: "untitled-feb11_19-42",
    name: "Heritage Milano Blue Cup And Saucer Set Of 6",
    nameUrdu: "ہیریٹیج میلانو بلیو کپ اور تشتری سیٹ",
    category: "cup-saucer-sets",
    categoryUrdu: "کپ اور تشتری سیٹ",
    description:
      "Milano's signature blue pattern in a heritage cup and saucer set. The rich cobalt blue floral motifs on cream porcelain create a timeless, Mediterranean-inspired aesthetic.",
    descriptionUrdu:
      "ہیریٹیج کپ اور تشتری سیٹ میں میلانو کی مخصوص نیلی ڈیزائن۔ خاموش کریم چینی مٹی پر گہرے کووبالٹ نیلے پھول ایک لازوال، بحیرہ روم سے متاثر جمالیاتی تخلیق کرتے ہیں۔",
    images: [
      img("4602A3AD-5E98-42B0-BA1D-745D1668BBD0_8fc7ffd3-67a7-4418-9db6-e696f4d1687b.jpg", "1775062066"),
    ],
    basePrice: 6000,
    variants: [
      { id: "v5", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-MIL-BLU-6", price: 6000, stock: 14, size: "250ml" },
    ],
  },
  {
    id: "p6",
    slug: "milano-pink-cup-and-saucer-set-of-6-250ml",
    name: "Heritage Milano Pink Cup And Saucer Set Of 6",
    nameUrdu: "ہیریٹیج میلانو پنک کپ اور تشتری سیٹ",
    category: "cup-saucer-sets",
    categoryUrdu: "کپ اور تشتری سیٹ",
    description:
      "The beloved Milano pattern in a soft, romantic pink. This cup and saucer set of 6 adds a delicate touch of colour to any table setting.",
    descriptionUrdu:
      "یہ محبوب میلانو پیٹرن نرم اور رومانوی گلابی رنگ میں۔ یہ کپ اور تشتری سیٹ کسی بھی میز کی سجاوٹ میں نازک رنگ کا اضافہ کرتا ہے۔",
    images: [
      img("2D4EB2FE-7BD6-4935-A667-CE2FDDAE2349.jpg", "1775071021"),
    ],
    basePrice: 6000,
    featured: true,
    variants: [
      { id: "v6", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-MIL-PNK-6", price: 6000, stock: 11, size: "250ml" },
    ],
  },
  {
    id: "p7",
    slug: "heritage-brown-coffee-shop-mug-set-of-6",
    name: "Heritage Brown Coffee Shop Mug Set Of 6",
    nameUrdu: "ہیریٹیج براؤن کافی شاپ مگ سیٹ",
    category: "ceramics",
    categoryUrdu: "سیرامکس",
    description:
      "Chunky, café-style mugs in a rich heritage brown glaze. Each 350ml mug holds the perfect serving of your favourite brew, and their thick walls keep coffee warmer for longer.",
    descriptionUrdu:
      "گہرے بھورے ہیریٹیج گلیز کے ساتھ بھاری بھرکم، کافی شاپ طرز کے مگ۔ ہر 350ml مگ آپ کے پسندیدہ مشروب کی بہترین مقدار کے لیے موزوں ہے، اور ان کی موٹی دیواریں کافی کو زیادہ دیر تک گرم رکھتی ہیں۔",
    images: [
      img("0F6E4B15-64F6-4A43-855F-43786741089D.jpg", "1775123898"),
    ],
    basePrice: 5000,
    featured: true,
    variants: [
      { id: "v7", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-BRN-MUG-6", price: 5000, stock: 18, size: "350ml" },
    ],
  },
  {
    id: "p8",
    slug: "heritage-blue-lighthouse-mug-set-of-6-350ml",
    name: "Heritage Blue Lighthouse Mug Set Of 6",
    nameUrdu: "ہیریٹیج بلیو لائٹ ہاؤس مگ سیٹ",
    category: "drinkware",
    categoryUrdu: "پینے کے برتن",
    description:
      "Nautical charm meets artisan craftsmanship. This blue lighthouse set of 6 mugs brings a coastal, heritage character to your morning coffee ritual.",
    descriptionUrdu:
      "بحری دلکشی اور دستکاری کا حسین امتزاج۔ یہ بلیو لائٹ ہاؤس مگ سیٹ آپ کی صبح کی کافی کی رسم میں ساحلی اور ہیریٹیج کردار لاتا ہے۔",
    images: [
      img("E3CBF9B9-077F-4FF4-933D-F0E2575A07C3.jpg", "1775123640"),
    ],
    basePrice: 5000,
    variants: [
      { id: "v8", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "HER-LH-MUG-6", price: 5000, stock: 9, size: "350ml" },
    ],
  },
  {
    id: "p9",
    slug: "danny-home-all-purpose-porcelain-bowls-set-of-6-4-75in",
    name: "Danny Home All Purpose Porcelain Bowls Set Of 6",
    nameUrdu: "ڈینی ہوم آل پرپز پورسلین پیالے سیٹ 6",
    category: "danny-home",
    categoryUrdu: "ڈینی ہوم",
    description:
      "Versatile all-purpose porcelain bowls in a set of 6. Perfect for soup, salad, desserts, or everyday meals. Durable, stackable, and dishwasher-safe.",
    descriptionUrdu:
      "ورسٹائل آل پرپز پورسلین پیالوں کا سیٹ۔ سوپ، سلاد، میٹھے یا روزمرہ کھانوں کے لیے بہترین۔ پائیدار، اسٹیک ایبل اور ڈش واشر محفوظ۔",
    images: [
      img("15208D52-D77A-48EF-AA0E-6AD391D60B86.jpg", "1775071429"),
    ],
    basePrice: 3500,
    featured: true,
    variants: [
      { id: "v9", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "DHN-BOWL-6", price: 3500, stock: 25, size: "4.75in" },
      { id: "v10", name: "Set of 10", nameUrdu: "10 کا سیٹ", sku: "DHN-BOWL-10", price: 5000, stock: 12, size: "4.75in" },
    ],
  },
  {
    id: "p10",
    slug: "danny-home-bowl-set-of-6",
    name: "Danny Home Bowl Set Of 6",
    nameUrdu: "ڈینی ہوم پیالے سیٹ 6",
    category: "danny-home",
    categoryUrdu: "ڈینی ہوم",
    description:
      "Premium Danny Home bowls in a set of 6 with a smooth, elegant finish. Ideal for every serving need, from breakfast to dinner.",
    descriptionUrdu:
      "پریمیم ڈینی ہوم پیالوں کا سیٹ جس میں ہموار اور خوبصورت تکمیل ہے۔ ناشتے سے لے کر رات کے کھانے تک ہر خدمت کی ضرورت کے لیے مثالی۔",
    images: [
      img("CD4743B0-1DF7-406F-81D6-7DE17CCE539D.jpg", "1775125744"),
    ],
    basePrice: 6500,
    variants: [
      { id: "v11", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "DHN-BOWL2-6", price: 6500, stock: 7 },
    ],
  },
  {
    id: "p11",
    slug: "danny-home-deep-plates-set-of-6",
    name: "Danny Home Deep Plates Set Of 6",
    nameUrdu: "ڈینی ہوم گہری پلیٹیں سیٹ 6",
    category: "ceramics",
    categoryUrdu: "سیرامکس",
    description:
      "Deep plates with generous rims, perfect for curries, gravies, and hearty meals. Set of 6 in durable porcelain.",
    descriptionUrdu:
      "گہری پلیٹیں جن کے کنارے کشادہ ہیں، کریمی، سالن اور دل بھرے کھانوں کے لیے بہترین۔ پائیدار چینی مٹی میں سیٹ 6۔",
    images: [
      img("CEB77706-3E5C-4780-823E-895D83619942.jpg", "1775125559"),
    ],
    basePrice: 7500,
    variants: [
      { id: "v12", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "DHN-PLT-6", price: 7500, stock: 6 },
    ],
  },
  {
    id: "p12",
    slug: "blue-floral-10-pcs-plate-set",
    name: "Blue Floral 10 pcs Plate Set",
    nameUrdu: "بلیو فلورل 10 پی سیس پلیٹ سیٹ",
    category: "ceramics",
    categoryUrdu: "سیرامکس",
    description:
      "A stunning 10 piece dinner set with delicate blue floral hand-painted patterns. A complete serving solution for formal dining.",
    descriptionUrdu:
      "نازک نیلے پھولوں کے ہاتھ سے پینٹ شدہ نمونوں کے ساتھ حیرت انگیز 10 پیس ڈنر سیٹ۔ رسمی کھانے کے لیے مکمل خدمت کا حل۔",
    images: [
      img("3F3A80EA-9726-43C9-9DC6-AE4FE41DFD23.jpg", "1776873101"),
    ],
    basePrice: 10000,
    featured: true,
    variants: [
      { id: "v13", name: "Set of 10", nameUrdu: "10 کا سیٹ", sku: "BLU-FLO-10", price: 10000, stock: 5 },
    ],
  },
  {
    id: "p13",
    slug: "blue-floral-set-of-6-quarter-plates",
    name: "Blue Floral Set Of 6 Quarter Plates",
    nameUrdu: "بلیو فلورل کوارٹر پلیٹیں سیٹ 6",
    category: "ceramics",
    categoryUrdu: "سیرامکس",
    description:
      "Quarter plates with charming blue floral detailing, set of 6. Perfect for appetizers, bread, and side servings.",
    descriptionUrdu:
      "دلکش بلیو فلورل تفصیل کے ساتھ کوارٹر پلیٹیں، سیٹ 6۔ اسٹارٹرز، بریڈ اور سائڈ سرونگ کے لیے بہترین۔",
    images: [
      img("8BB3FA24-BF88-45B3-B8D3-2F0F6F13A071.jpg", "1777400881"),
    ],
    basePrice: 3000,
    soldOut: true,
    variants: [
      { id: "v14", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "BLU-FLO-QP-6", price: 3000, stock: 0 },
    ],
  },
  {
    id: "p14",
    slug: "ribbed-coffee-tumbler-500ml",
    name: "Ribbed Coffee Tumbler 500ML",
    nameUrdu: "ریبڈ کافی ٹمبلر 500 ایم ایل",
    category: "drinkware",
    categoryUrdu: "پینے کے برتن",
    description:
      "A stylish ribbed glass tumbler for your iced coffee and beverages. Holds 500ml and features a sleek, tactile ribbed texture.",
    descriptionUrdu:
      "آئسڈ کافی اور مشروبات کے لیے ایک سجیلا ریبڈ گلاس ٹمبلر۔ 500ml گنجائش اور ہموار، چھونے میں خوشگوار ساخت۔",
    images: [
      img("38DE2863-EEDC-439B-9204-2A7592F80562_57ff51ea-5d6a-4440-b0ba-1c292035d274.jpg", "1771721888"),
    ],
    basePrice: 1200,
    featured: true,
    variants: [
      { id: "v15", name: "Single", nameUrdu: "واحد", sku: "RIB-TMB-500", price: 1200, stock: 30, size: "500ml" },
    ],
  },
  {
    id: "p15",
    slug: "plain-double-wall-mug-350ml",
    name: "Plain Double Wall Mug 350ml",
    nameUrdu: "پلین ڈبل وال مگ 350 ایم ایل",
    category: "drinkware",
    categoryUrdu: "پینے کے برتن",
    description:
      "Elegant plain double wall mug that keeps your drink hot while staying cool to touch. Modern minimal design in 350ml.",
    descriptionUrdu:
      "خوبصورت پلین ڈبل وال مگ جو آپ کے مشروب کو گرم رکھتا ہے جبکہ بیرونی سطح ٹھنڈی رہتی ہے۔ جدید مینیمل ڈیزائن 350ml میں۔",
    images: [
      img("CFFB2167-F49E-4384-AEA9-2904A5193C27_184064b5-2071-4dc2-a0ba-fa6145b2a03d.jpg", "1775058412"),
    ],
    basePrice: 900,
    featured: true,
    variants: [
      { id: "v16", name: "Single", nameUrdu: "واحد", sku: "DW-MUG-350", price: 900, stock: 40, size: "350ml" },
    ],
  },
  {
    id: "p16",
    slug: "tall-glass-350ml",
    name: "Tall Glass 350ml",
    nameUrdu: "ٹال گلاس 350 ایم ایل",
    category: "drinkware",
    categoryUrdu: "پینے کے برتن",
    description:
      "Clean, tall glass perfect for cold drinks, juices, and sodas. Holds 350ml of your favourite refreshment.",
    descriptionUrdu:
      "صاف ستھرا ٹال گلاس ٹھنڈے مشروبات، جوس اور سوڈا کے لیے بہترین۔ آپ کے پسندیدہ مشروب کی 350ml گنجائش۔",
    images: [
      img("F5AF6F6F-3A6D-486F-9ED8-CA7C8D9F4029.jpg", "1775127548"),
    ],
    basePrice: 1000,
    variants: [
      { id: "v17", name: "Single", nameUrdu: "واحد", sku: "TAL-GLS-350", price: 1000, stock: 22, size: "350ml" },
    ],
  },
  {
    id: "p17",
    slug: "mbr",
    name: "Round Glass 350ml",
    nameUrdu: "راونڈ گلاس 350 ایم ایل",
    category: "drinkware",
    categoryUrdu: "پینے کے برتن",
    description:
      "A rounded, elegant drinking glass ideal for water, soft drinks, or juice. Simple design that suits any table.",
    descriptionUrdu:
      "ایک گول، خوبصورت پینے کا گلاس پانی، سافٹ ڈرنکس یا جوس کے لیے موزوں۔ سادہ ڈیزائن جو کسی بھی میز پر سجتا ہے۔",
    images: [
      img("A5D61BF2-7B84-460F-959A-2D1E1598B8C4.jpg", "1775128115"),
    ],
    basePrice: 1200,
    variants: [
      { id: "v18", name: "Single", nameUrdu: "واحد", sku: "RND-GLS-350", price: 1200, stock: 18, size: "350ml" },
    ],
  },
  {
    id: "p18",
    slug: "124",
    name: "Square Coffee Tumbler 500ml",
    nameUrdu: "سکوائر کافی ٹمبلر 500 ایم ایل",
    category: "drinkware",
    categoryUrdu: "پینے کے برتن",
    description:
      "Modern square-shaped coffee tumbler. The unique geometric silhouette holds 500ml and looks stunning on any desk or table.",
    descriptionUrdu:
      "جدید سکوائر شکل کا کافی ٹمبلر۔ منفرد جیومیٹرک شکل 500ml کی گنجائش رکھتی ہے اور کسی بھی میز پر حیرت انگیز نظر آتی ہے۔",
    images: [
      img("3987F024-7CBA-4868-B971-AC53852F274C.jpg", "1775127179"),
    ],
    basePrice: 1200,
    variants: [
      { id: "v19", name: "Single", nameUrdu: "واحد", sku: "SQR-TMB-500", price: 1200, stock: 20, size: "500ml" },
    ],
  },
  {
    id: "p19",
    slug: "untitled-feb13_19-03",
    name: "Plain Storage Jar Set Of 3",
    nameUrdu: "پلین اسٹوریج جار سیٹ 3",
    category: "storage",
    categoryUrdu: "ذخیرہ کرنے کے برتن",
    description:
      "Minimal plain glass storage jars in a set of 3. Use them for dry goods, spices, or pantry staples to bring order and beauty to your kitchen.",
    descriptionUrdu:
      "پلین گلاس اسٹوریج جار کا سیٹ 3۔ خشک اشیاء، مسالوں یا گھریلو ضروریات کے لیے استعمال کریں تاکہ آپ کے کچن میں ترتیب اور خوبصورتی آئے۔",
    images: [
      img("D0F9499E-15A6-465E-A649-75CD6646C732.jpg", "1771720939"),
    ],
    basePrice: 2000,
    featured: true,
    variants: [
      { id: "v20", name: "Set of 3", nameUrdu: "3 کا سیٹ", sku: "PLN-JAR-3", price: 2000, stock: 16 },
    ],
  },
  {
    id: "p20",
    slug: "ribbed-storage-jar-set-of-3",
    name: "Ribbed Storage Jar Set Of 3",
    nameUrdu: "ریبڈ اسٹوریج جار سیٹ 3",
    category: "storage",
    categoryUrdu: "ذخیرہ کرنے کے برتن",
    description:
      "Elegant ribbed glass storage jars with airtight lids, set of 3. Keep your ingredients fresh while adding a designer touch to your shelves.",
    descriptionUrdu:
      "خوبصورت ریبڈ گلاس اسٹوریج جار airtight ڈھکنوں کے ساتھ، سیٹ 3۔ اپنے اجزاء کو تازہ رکھیں جبکہ اپنی شیلفوں میں ڈیزائنر جھلک شامل کریں۔",
    images: [
      img("E8DD2FE4-1B2C-44B5-B624-19FA511A9331.jpg", "1775126052"),
    ],
    basePrice: 2500,
    variants: [
      { id: "v21", name: "Set of 3", nameUrdu: "3 کا سیٹ", sku: "RIB-JAR-3", price: 2500, stock: 14 },
    ],
  },
  {
    id: "p21",
    slug: "spoon-jars",
    name: "Spoon Jars Set Of 3",
    nameUrdu: "اسپون جار سیٹ 3",
    category: "tableware",
    categoryUrdu: "ٹیبل ویئر",
    description:
      "Beautiful glass jars designed to hold and display your spoons and cutlery. Set of 3 for a coordinated kitchen look.",
    descriptionUrdu:
      "خوبصورت گلاس جار جو آپ کے چمچے اور کچن کے برتن رکھنے اور دکھانے کے لیے بنائے گئے ہیں۔ ہم آہنگ کچن ظاہری شکل کے لیے سیٹ 3۔",
    images: [
      img("207EF5DD-6037-4592-A4FD-87D6CECFB757.jpg", "1775130617"),
    ],
    basePrice: 3300,
    variants: [
      { id: "v22", name: "Set of 3", nameUrdu: "3 کا سیٹ", sku: "SPN-JAR-3", price: 3300, stock: 10 },
    ],
  },
  {
    id: "p22",
    slug: "ball-cork-jar-set-of-3",
    name: "Ball Cork Jar Set Of 3",
    nameUrdu: "بال کارک جار سیٹ 3",
    category: "storage",
    categoryUrdu: "ذخیرہ کرنے کے برتن",
    description:
      "Charming glass jars with natural cork lids in a set of 3. Perfect for storing preserves, dry goods, or as elegant kitchen decor.",
    descriptionUrdu:
      "قدرتی کارک ڈھکنوں کے ساتھ دلکش گلاس جار، سیٹ 3۔ محفوظ اشیاء، خشک اجزاء رکھنے یا خوبصورت کچن سجاوٹ کے لیے بہترین۔",
    images: [
      img("2971F323-336C-4255-9C51-1DFB43B9F191.jpg", "1775125941"),
    ],
    basePrice: 3600,
    featured: true,
    variants: [
      { id: "v23", name: "Set of 3", nameUrdu: "3 کا سیٹ", sku: "BAL-CRK-3", price: 3600, stock: 13 },
    ],
  },
  {
    id: "p23",
    slug: "untitled-apr2_17-30",
    name: "Trifle Bowl",
    nameUrdu: "ٹرائفل باؤل",
    category: "tableware",
    categoryUrdu: "ٹیبل ویئر",
    description:
      "A stunning glass trifle bowl, perfect for layering desserts and showcasing beautiful creations for special occasions.",
    descriptionUrdu:
      "ایک شاندار گلاس ٹرائفل باؤل، میٹھے کی تہوں کے لیے اور خاص مواقع پر خوبصورت تخلیقات دکھانے کے لیے بہترین۔",
    images: [
      img("IMG-4943.png", "1775149548"),
    ],
    basePrice: 5000,
    variants: [
      { id: "v24", name: "Single", nameUrdu: "واحد", sku: "TRF-BOWL", price: 5000, stock: 4 },
    ],
  },
  {
    id: "p24",
    slug: "black-floral-set-of-6-quarter-plates",
    name: "Black Floral Set Of 6 Quarter Plates",
    nameUrdu: "بلیک فلورل کوارٹر پلیٹیں سیٹ 6",
    category: "ceramics",
    categoryUrdu: "سیرامکس",
    description:
      "Dramatic black floral quarter plates in a set of 6. Bold and sophisticated, perfect for appetizers and desserts.",
    descriptionUrdu:
      "ڈرامائی بلیک فلورل کوارٹر پلیٹیں سیٹ 6۔ جرات مندانہ اور نفیس، اسٹارٹرز اور میٹھوں کے لیے بہترین۔",
    images: [
      img("41303387-BFF6-44A1-B934-AC8094D7157A.jpg", "1776881280"),
    ],
    basePrice: 3000,
    variants: [
      { id: "v25", name: "Set of 6", nameUrdu: "6 کا سیٹ", sku: "BLK-FLO-QP-6", price: 3000, stock: 9 },
    ],
  },
]

export async function getProductsFromAPI() {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' })
    if (!res.ok) return products
    return await res.json()
  } catch {
    return products
  }
}

export async function getProductBySlugFromAPI(slug: string) {
  try {
    const res = await fetch(`/api/products/${slug}`, { cache: 'no-store' })
    if (!res.ok) return getProductBySlug(slug)
    return await res.json()
  } catch {
    return getProductBySlug(slug)
  }
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((p) => p.category === categorySlug)
}

export function getFeaturedProducts() {
  return products.filter((p) => p.featured)
}

export const formatPrice = (price: number) => {
  return `PKR ${price.toLocaleString("en-PK")}`
}
# Instagram Product Scraper for Adina Household

This scraper automatically fetches products from the Adina Household Instagram page and adds them to your website's database.

## Setup

1. **Get an Apify API Key**
   - Sign up at https://apify.com
   - Go to Settings > Integrations > API tokens
   - Copy your API token

2. **Add the API key to .env**
   ```bash
   APIFY_API_KEY="your_actual_api_key_here"
   ```

3. **Run the scraper**
   ```bash
   npm run scrape
   ```

## What it does

1. **Scrapes Instagram posts** from @adina.household
2. **Extracts product information**:
   - Product name from caption
   - Price (looks for PKR, Rs, ₨ patterns)
   - Images from posts
   - Videos from posts
   - Auto-categorizes based on keywords

3. **Adds to database**:
   - Creates missing categories
   - Adds new products with variants
   - Skips existing products (checks by slug)
   - Saves all data to `scraped-products.json`

4. **Updates existing products**:
   - Adds videos to products that already exist

## How it categorizes

- **Cup & Saucer Sets**: Contains "cup" and "saucer"
- **Drinkware**: Contains "mug", "tumbler", or "glass"
- **Ceramics**: Contains "plate" or "bowl"
- **Storage**: Contains "storage" or "jar"
- **Danny Home**: Contains "danny home"
- **Tableware**: Contains "spoon" or "cutlery"
- **Default**: Ceramics

## Video Support

The scraper automatically detects and saves video URLs from Instagram posts. Videos are stored alongside product images and can be displayed on product pages.

## Output

- New products are added to the database
- Full scraping results saved to `scraped-products.json`
- Console shows summary of what was added

## Troubleshooting

**No products found?**
- Check if posts have price information (PKR, Rs, etc.)
- Verify the Instagram URL is correct
- Check Apify usage limits

**Products not showing on website?**
- Run `npx prisma studio` to view database
- Verify products were added correctly
- Check if database migration is needed

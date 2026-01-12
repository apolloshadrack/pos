import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: 'Tusker Lager 500ml',
    barcode: '1234567890001',
    category: 'beer',
    price: 250,
    stock: 120,
    abv: 4.2,
  },
  {
    name: 'White Cap 500ml',
    barcode: '1234567890002',
    category: 'beer',
    price: 230,
    stock: 90,
    abv: 4.0,
  },
  {
    name: 'Pilsner 500ml',
    barcode: '1234567890003',
    category: 'beer',
    price: 200,
    stock: 150,
    abv: 4.5,
  },
  {
    name: 'Guinness 500ml',
    barcode: '1234567890004',
    category: 'beer',
    price: 280,
    stock: 80,
    abv: 7.5,
  },
  {
    name: 'Heineken 330ml',
    barcode: '1234567890005',
    category: 'beer',
    price: 300,
    stock: 60,
    abv: 5.0,
  },
  {
    name: '4th Street Sweet Red 750ml',
    barcode: '1234567890006',
    category: 'wine',
    price: 450,
    stock: 50,
    abv: 7.0,
  },
  {
    name: 'Drostdy-Hof Cabernet 750ml',
    barcode: '1234567890007',
    category: 'wine',
    price: 520,
    stock: 29,
    abv: 13.5,
  },
  {
    name: 'Nederburg Sauvignon Blanc',
    barcode: '1234567890008',
    category: 'wine',
    price: 680,
    stock: 24,
    abv: 12.5,
  },
  {
    name: 'Jambo Wine Red 750ml',
    barcode: '1234567890009',
    category: 'wine',
    price: 380,
    stock: 44,
    abv: 12.0,
  },
  {
    name: 'Smirnoff Vodka 750ml',
    barcode: '1234567890010',
    category: 'spirits',
    price: 1200,
    stock: 35,
    abv: 40.0,
  },
  {
    name: 'Johnnie Walker Red Label 750ml',
    barcode: '1234567890011',
    category: 'spirits',
    price: 2500,
    stock: 20,
    abv: 40.0,
  },
  {
    name: 'Captain Morgan Spiced Rum 750ml',
    barcode: '1234567890012',
    category: 'spirits',
    price: 1800,
    stock: 25,
    abv: 35.0,
  },
  {
    name: 'Savanna Dry Cider 500ml',
    barcode: '1234567890013',
    category: 'cider',
    price: 220,
    stock: 75,
    abv: 5.5,
  },
  {
    name: 'Hunter\'s Gold Cider 500ml',
    barcode: '1234567890014',
    category: 'cider',
    price: 240,
    stock: 65,
    abv: 5.0,
  },
]

async function seedProducts() {
  console.log('🌱 Starting to seed products to MongoDB...\n')

  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  for (const product of sampleProducts) {
    try {
      // Check if product with this barcode already exists
      const existing = await prisma.product.findUnique({
        where: { barcode: product.barcode },
      })

      if (existing) {
        console.log(`⏭️  Skipping ${product.name} - already exists`)
        skippedCount++
        continue
      }

      const result = await prisma.product.create({
        data: product,
      })
      console.log(`✅ Added: ${product.name} (${product.category})`)
      successCount++
    } catch (error: any) {
      console.error(`❌ Error adding ${product.name}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n✨ Seeding complete!`)
  console.log(`   ✅ Successfully added: ${successCount} products`)
  console.log(`   ⏭️  Skipped (already exist): ${skippedCount} products`)
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`)
  }
}

seedProducts()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

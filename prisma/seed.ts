import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/client'
// import { createWasteData } from './seed/create-waste'
// import { createAchievementsData } from './seed/create-achievements'
// import { createPointsData } from './seed/create-points'
import { fixAllSlugs } from './seed/fix-slug'
// import { generateUsers } from './seed/generate-users'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
	console.log('🌱 Start seeding waste types...')

	// await createWasteData(prisma)
	// await createAchievementsData(prisma)
	// await createPointsData(prisma)
	// await generateUsers(prisma)
	await fixAllSlugs(prisma)

	console.log('✅ Seeding finished.')
}

main()
	.then(async () => {
		await prisma.$disconnect()
		await pool.end()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		await pool.end()
		process.exit(1)
	})

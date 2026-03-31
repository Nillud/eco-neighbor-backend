/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Unit } from '../prisma/generated/client'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const createWasteData = async () => {
	const wasteTypes = [
		{ name: 'Пластик', slug: 'plastic' },
		{ name: 'Бумага', slug: 'paper' },
		{ name: 'Стекло', slug: 'glass' },
		{ name: 'Металл', slug: 'metal' },
		{ name: 'Одежда', slug: 'clothing' },
		{ name: 'Опасные отходы', slug: 'hazardous' },
		{ name: 'Батарейки', slug: 'batteries' }
	]
	for (const type of wasteTypes) {
		await prisma.waste.upsert({
			where: { slug: type.slug },
			update: {},
			create: type
		})
	}
}

const createAchievementsData = async () => {
	const achievements = [
		{
			title: 'Электроник',
			description: 'Сдайте 100 батареек в пункты приема.',
			iconUrl: '',
			requirementCount: 100,
			unit: Unit.THING,
			category: 'waste',
			slug: 'battery',
			points: 100
		},
		{
			title: 'Пластмассовый мир победил',
			description: 'Сдайте 10кг пластмассы в пункты приема.',
			iconUrl: '',
			requirementCount: 10,
			unit: Unit.KG,
			category: 'waste',
			slug: 'plastic',
			points: 100
		},
		{
			title: 'Бумажный тигр',
			description: 'Сдайте 10кг макулатуры в пункты приема.',
			iconUrl: '',
			requirementCount: 10,
			unit: Unit.KG,
			category: 'waste',
			slug: 'paper',
			points: 100
		},
		{
			title: 'Эко-активист',
			description: 'Добавьте 5 новых точек сбора отходов.',
			iconUrl: '',
			requirementCount: 5,
			unit: Unit.THING,
			category: 'map',
			slug: 'point',
			points: 100
		},
		{
			title: 'Доброе сердце',
			description: 'Закройте 3 объявления в категории "Отдам даром".',
			iconUrl: '',
			requirementCount: 3,
			unit: Unit.THING,
			category: 'ad',
			slug: 'giveaway',
			points: 100
		},
		{
			title: 'Мастер чистоты',
			description:
				'Примите участие в 5 субботниках (закрытые объявления "Уборка").',
			iconUrl: '',
			requirementCount: 5,
			unit: Unit.THING,
			category: 'event',
			slug: 'cleanup',
			points: 100
		}
	]

	console.log('🏆 Seeding achievements...')

	for (const ach of achievements) {
		await prisma.achievement.upsert({
			where: { title: ach.slug },
			update: {},
			create: ach
		})
	}
}

async function main() {
	console.log('🌱 Start seeding waste types...')

	await createWasteData()
	await createAchievementsData()

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

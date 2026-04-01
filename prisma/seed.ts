/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PointType, PrismaClient, Unit } from '../prisma/generated/client'

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

const createPointsData = async () => {
	const allWastes = await prisma.waste.findMany()
	const wasteMap = Object.fromEntries(allWastes.map(w => [w.slug, w.id]))

	// 2. Данные точек в Дёме
	const points = [
		{
			title: 'Контейнер ПЭТ',
			address: 'ул. Правды, 25',
			lat: 54.7012,
			lng: 55.851,
			type: PointType.CONTAINER,
			wastes: ['plastic']
		},
		{
			title: 'Пункт приема макулатуры',
			address: 'ул. Ухтомского, 12',
			lat: 54.698,
			lng: 55.855,
			type: PointType.POINT,
			wastes: ['paper', 'metal']
		},
		{
			title: 'Эко-бокс для батареек',
			address: 'ул. Левитана, 14/1',
			lat: 54.6945,
			lng: 55.849,
			type: PointType.CONTAINER,
			wastes: ['batteries']
		},
		{
			title: 'Сбор стекла и пластика',
			address: 'ул. Центральная, 18',
			lat: 54.705,
			lng: 55.842,
			type: PointType.CONTAINER,
			wastes: ['glass', 'plastic']
		},
		{
			title: 'Пункт "Чистый город"',
			address: 'ул. Грозненская, 67',
			lat: 54.69,
			lng: 55.86,
			type: PointType.POINT,
			wastes: ['plastic', 'paper', 'glass', 'metal']
		},
		{
			title: 'Контейнер для одежды',
			address: 'ул. Таллинская, 7',
			lat: 54.7035,
			lng: 55.858,
			type: PointType.CONTAINER,
			wastes: ['clothing']
		},
		{
			title: 'Спецавтохозяйство (Опасные)',
			address: 'ул. Магистральная, 2',
			lat: 54.71,
			lng: 55.835,
			type: PointType.POINT,
			wastes: ['hazardous', 'batteries']
		},
		{
			title: 'ПЭТ-сетка',
			address: 'ул. Мусоргского, 15',
			lat: 54.697,
			lng: 55.845,
			type: PointType.CONTAINER,
			wastes: ['plastic']
		},
		{
			title: 'Прием металла',
			address: 'ул. Дагестанская, 21',
			lat: 54.688,
			lng: 55.852,
			type: PointType.POINT,
			wastes: ['metal']
		},
		{
			title: 'Универсальный пункт',
			address: 'ул. Минская, 58',
			lat: 54.708,
			lng: 55.848,
			type: PointType.POINT,
			wastes: ['paper', 'plastic', 'clothing']
		},
		// Добавим еще 10 точек для плотности
		{
			title: 'Контейнер во дворе',
			address: 'ул. Правды, 10',
			lat: 54.7025,
			lng: 55.853,
			type: PointType.CONTAINER,
			wastes: ['plastic']
		},
		{
			title: 'Сбор макулатуры (Школа)',
			address: 'ул. Ухтомского, 28',
			lat: 54.696,
			lng: 55.857,
			type: PointType.POINT,
			wastes: ['paper']
		},
		{
			title: 'Аптека (Прием батареек)',
			address: 'ул. Левитана, 3',
			lat: 54.6955,
			lng: 55.8505,
			type: PointType.CONTAINER,
			wastes: ['batteries']
		},
		{
			title: 'Рядом с Магнитом',
			address: 'ул. Дагестанская, 33',
			lat: 54.6865,
			lng: 55.854,
			type: PointType.CONTAINER,
			wastes: ['plastic', 'glass']
		},
		{
			title: 'Пункт приема "Эко"',
			address: 'ул. Островского, 16',
			lat: 54.6995,
			lng: 55.846,
			type: PointType.POINT,
			wastes: ['metal', 'glass']
		},
		{
			title: 'Сетка для бутылок',
			address: 'ул. Генерала Кусимова, 15',
			lat: 54.682,
			lng: 55.859,
			type: PointType.CONTAINER,
			wastes: ['plastic']
		},
		{
			title: 'Бокс для ламп',
			address: 'ул. Грозненская, 69',
			lat: 54.6895,
			lng: 55.8615,
			type: PointType.CONTAINER,
			wastes: ['hazardous']
		},
		{
			title: 'Пункт ветоши',
			address: 'ул. Мусоргского, 2',
			lat: 54.6985,
			lng: 55.8415,
			type: PointType.POINT,
			wastes: ['clothing']
		},
		{
			title: 'Мастерская (Прием лома)',
			address: 'ул. Центральная, 22',
			lat: 54.706,
			lng: 55.8405,
			type: PointType.POINT,
			wastes: ['metal']
		},
		{
			title: 'Эко-точка ТЦ',
			address: 'ул. Правды, 21',
			lat: 54.7018,
			lng: 55.8502,
			type: PointType.POINT,
			wastes: ['batteries', 'paper']
		}
	]

	console.log('Seed: Creating map points...')

	for (const p of points) {
		await prisma.mapPoint.create({
			data: {
				title: p.title,
				address: p.address,
				latitude: p.lat,
				longitude: p.lng,
				type: p.type,
				isVerified: true,
				wasteMapPoints: {
					create: p.wastes.map(slug => ({
						wasteId: wasteMap[slug]
					}))
				}
			}
		})
	}
}

async function main() {
	console.log('🌱 Start seeding waste types...')

	await createWasteData()
	await createAchievementsData()
	await createPointsData()

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

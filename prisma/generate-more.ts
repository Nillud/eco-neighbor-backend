import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as argon2 from 'argon2'
import { slugify } from 'transliteration'
import {
	PrismaClient,
	Role,
	Unit,
	PointType,
	AdType,
	Status,
	EventCategory,
	EventStatus,
	User
} from '../prisma/generated/client'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Вспомогательная функция для получения случайного элемента из массива
const randomElement = <T>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)]
// Случайное число в диапазоне
const randomRange = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min

async function main() {
	console.log('🌱 Starting expanded seeding process...')

	// --- 1. ОЧИСТКА БАЗЫ ---
	console.log('🧹 Cleaning database...')
	await prisma.wasteMapPoint.deleteMany()
	await prisma.eventParticipant.deleteMany()
	await prisma.userAchievement.deleteMany()
	await prisma.message.deleteMany()
	await prisma.ad.deleteMany()
	await prisma.event.deleteMany()
	await prisma.mapPoint.deleteMany()
	await prisma.achievement.deleteMany()
	await prisma.waste.deleteMany()
	await prisma.user.deleteMany()

	// --- 2. СПРАВОЧНИКИ ---
	console.log('📦 Seeding reference data...')
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
		await prisma.waste.create({ data: type })
	}

	const achievements = [
		{
			title: 'Электроник',
			slug: 'battery',
			description: 'Сдайте 100 батареек.',
			requirementCount: 100,
			unit: Unit.THING,
			category: 'waste',
			points: 100,
			iconUrl: ''
		},
		{
			title: 'Пластмассовый мир победил',
			slug: 'plastic',
			description: 'Сдайте 10кг пластмассы.',
			requirementCount: 10,
			unit: Unit.KG,
			category: 'waste',
			points: 100,
			iconUrl: ''
		},
		{
			title: 'Бумажный тигр',
			slug: 'paper',
			description: 'Сдайте 10кг макулатуры.',
			requirementCount: 10,
			unit: Unit.KG,
			category: 'waste',
			points: 100,
			iconUrl: ''
		},
		{
			title: 'Эко-активист',
			slug: 'point',
			description: 'Добавьте 5 новых точек.',
			requirementCount: 5,
			unit: Unit.THING,
			category: 'map',
			points: 100,
			iconUrl: ''
		},
		{
			title: 'Доброе сердце',
			slug: 'giveaway',
			description: 'Закройте 3 объявления "Отдам даром".',
			requirementCount: 3,
			unit: Unit.THING,
			category: 'ad',
			points: 100,
			iconUrl: ''
		}
	]
	for (const ach of achievements) {
		await prisma.achievement.create({ data: ach })
	}

	// --- 3. ПОЛЬЗОВАТЕЛИ (~25 пользователей) ---
	console.log('👥 Creating users...')
	const passwordHash = await argon2.hash('123456')

	const firstNames = [
		'Алексей',
		'Дмитрий',
		'Иван',
		'Сергей',
		'Михаил',
		'Александр',
		'Мария',
		'Елена',
		'Ольга',
		'Анна',
		'Татьяна',
		'Наталья'
	]
	const lastNames = [
		'Иванов',
		'Петров',
		'Соколов',
		'Смирнов',
		'Кузнецов',
		'Попов',
		'Васильев',
		'Новиков',
		'Федоров',
		'Морозов'
	]

	const users: User[] = []

	// Сначала админ
	const admin = await prisma.user.create({
		data: {
			name: 'Администратор Эко',
			email: 'admin@eco.com',
			role: Role.ADMIN,
			password: passwordHash,
			rating: 999,
			isEmailVerified: true,
			avatarUrl: 'https://github.com/identicons/admin.png'
		}
	})
	users.push(admin)

	// Генерируем еще 24 обычных пользователя
	for (let i = 1; i <= 24; i++) {
		const name = `${randomElement(firstNames)} ${randomElement(lastNames)}`
		const email = `user${i}@example.com`
		const user = await prisma.user.create({
			data: {
				name,
				email,
				role: Role.USER,
				password: passwordHash,
				rating: randomRange(10, 450),
				isEmailVerified: true,
				avatarUrl: `https://github.com/identicons/user${i}.png`
			}
		})
		users.push(user)
	}

	// --- 4. ТОЧКИ НА КАРТЕ ---
	console.log('📍 Creating map points...')
	const allWastes = await prisma.waste.findMany()
	const wasteMap = Object.fromEntries(allWastes.map(w => [w.slug, w.id]))

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
		}
	]
	for (const p of points) {
		await prisma.mapPoint.create({
			data: {
				title: p.title,
				address: p.address,
				latitude: p.lat,
				longitude: p.lng,
				type: p.type,
				isVerified: true,
				authorId: randomElement(users).id,
				wasteMapPoints: {
					create: p.wastes
						.filter(slug => wasteMap[slug])
						.map(slug => ({ wasteId: wasteMap[slug] }))
				}
			}
		})
	}

	// Массив заготовок фраз для чата
	const chatPhrases = [
		'Привет! Актуально?',
		'Да, конечно, пишите в ЛС или звоните.',
		'Отличная инициатива, поддержу!',
		'А где именно встречаемся?',
		'Я смогу подойти только на час позже.',
		'Спасибо большое, всё забрали!',
		'Подскажите, а пластик с маркировкой 5 принимаете?',
		'Да, принимаем любые виды.',
		'Буду обязательно!'
	]

	// --- 5. ОБЪЯВЛЕНИЯ (~20 штук) ---
	console.log('📢 Creating 20 ads...')
	const adTemplates = [
		{
			title: 'Отдам фикус в добрые руки',
			type: AdType.GIVEAWAY,
			desc: 'Забирать самовывозом. Большой, красивый.'
		},
		{
			title: 'Пакет старых джинс на апсайклинг',
			type: AdType.RECYCLE,
			desc: 'Подойдет для рукоделия или переработки.'
		},
		{
			title: 'Помощь в разборе старого сарая',
			type: AdType.NEED_HELP,
			desc: 'Нужно рассортировать доски и железо.'
		},
		{
			title: 'Отдам книги советских изданий',
			type: AdType.GIVEAWAY,
			desc: 'Классика, состояние хорошее, жалко выбрасывать.'
		},
		{
			title: 'Собрали мешок батареек, нужно отвезти',
			type: AdType.RECYCLE,
			desc: 'Сам не доеду до пункта, выручайте.'
		},
		{
			title: 'Нужны волонтеры для погрузки макулатуры',
			type: AdType.NEED_HELP,
			desc: 'В субботу утром на пару часов.'
		}
	]

	for (let i = 1; i <= 20; i++) {
		const template = adTemplates[i % adTemplates.length]
		const title = `${template.title} #${i}`
		const author = randomElement(users)

		const ad = await prisma.ad.create({
			data: {
				title,
				slug: `${slugify(title)}-${Math.random().toString(36).substring(2, 7)}`,
				description: template.desc,
				type: template.type,
				status: randomElement([Status.ACTIVE, Status.ACTIVE, Status.CLOSED]), // 66% активных
				authorId: author.id,
				phone: '+7 (999) 000-00-00',
				createdAt: new Date(Date.now() - randomRange(1, 10) * 86400000) // создано 1-10 дней назад
			}
		})

		// Добавляем 2-4 сообщения в чат объявления
		const msgCount = randomRange(2, 4)
		for (let m = 0; m < msgCount; m++) {
			await prisma.message.create({
				data: {
					text: randomElement(chatPhrases),
					senderId: randomElement(users).id,
					adId: ad.id
				}
			})
		}
	}

	// --- 6. МЕРОПРИЯТИЯ (~20 штук: прошедшие и будущие) ---
	console.log('📅 Creating 20 events (Past & Future)...')
	const eventTemplates = [
		{
			title: 'Субботник на набережной',
			cat: EventCategory.CLEANUP,
			desc: 'Очистим берег от пластика и стекла. Мешки и перчатки выдаем.'
		},
		{
			title: 'Лекция: Ноль отходов в быту',
			cat: EventCategory.WORKSHOP,
			desc: 'Разбираем основы осознанного потребления. Спикер из ЭкоЦентра.'
		},
		{
			title: 'Фримаркет и обмен одеждой',
			cat: EventCategory.EXCHANGE,
			desc: 'Приносите ненужные вещи в хорошем состоянии, забирайте то, что нравится.'
		},
		{
			title: 'Сбор электрохлама',
			cat: EventCategory.OTHER,
			desc: 'Принимаем старую бытовую технику, провода, сломанные телефоны.'
		},
		{
			title: 'Мастер-класс по плетению из газетных трубочек',
			cat: EventCategory.WORKSHOP,
			desc: 'Даем бумаге вторую жизнь.'
		},
		{
			title: 'Большая уборка лесополосы',
			cat: EventCategory.CLEANUP,
			desc: 'Собираем крупный мусор. После — чаепитие.'
		}
	]

	for (let i = 1; i <= 20; i++) {
		const template = eventTemplates[i % eventTemplates.length]
		const title = `${template.title} #${i}`
		const creator = randomElement(users)

		// 10 мероприятий в прошлом, 10 в будущем
		const isPast = i <= 10
		let eventDate: Date
		let status: EventStatus

		if (isPast) {
			eventDate = new Date(Date.now() - randomRange(1, 15) * 86400000) // 1-15 дней назад
			status = randomElement([
				EventStatus.FINISHED,
				EventStatus.FINISHED,
				EventStatus.CANCELLED
			]) // В основном завершенные
		} else {
			eventDate = new Date(Date.now() + randomRange(1, 15) * 86400000) // через 1-15 дней в будущем
			status = EventStatus.UPCOMING
		}

		const event = await prisma.event.create({
			data: {
				title,
				slug: `${slugify(title)}-${Math.random().toString(36).substring(2, 7)}`,
				description: template.desc,
				category: template.cat,
				location: `Эко-Локация №${randomRange(1, 5)}, ул. Ленина, д. ${i * 3}`,
				date: eventDate,
				latitude: 54.7 + (Math.random() - 0.5) * 0.1,
				longitude: 55.8 + (Math.random() - 0.5) * 0.1,
				creatorId: creator.id,
				status: status,
				maxParticipants: randomElement([null, 10, 15, 30])
			}
		})

		// --- Запись участников на мероприятие ---
		// Выбираем случайную группу пользователей (от 2 до 6 человек)
		const participantCount = randomRange(2, 6)
		// Перемешиваем пользователей для уникальности набора участников
		const shuffledUsers = [...users].sort(() => 0.5 - Math.random())
		const selectedUsers = shuffledUsers.slice(0, participantCount)

		for (const participant of selectedUsers) {
			await prisma.eventParticipant.create({
				data: {
					userId: participant.id,
					eventId: event.id
				}
			})
		}

		// --- Сообщения в чат мероприятия ---
		// Писать в чат могут те, кто записался
		const chatLength = randomRange(3, 5)
		for (let c = 0; c < chatLength; c++) {
			const sender = randomElement(selectedUsers)
			await prisma.message.create({
				data: {
					text: randomElement(chatPhrases),
					senderId: sender.id,
					eventId: event.id
				}
			})
		}
	}

	console.log('✅ Seeding finished successfully. Database is rich with data!')
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

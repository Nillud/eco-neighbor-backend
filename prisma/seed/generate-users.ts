/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as argon2 from 'argon2'
import {
	AdType,
	EventCategory,
	EventStatus,
	PrismaClient,
	Role,
	Status,
	User
} from 'prisma/generated/client'
import { slugify } from 'transliteration'

export async function generateUsers(prisma: PrismaClient) {
	// 1. Уровни связей (удаляем снизу вверх)
	await prisma.wasteMapPoint.deleteMany() // Связь отходов и точек
	await prisma.eventParticipant.deleteMany() // Участники ивентов
	await prisma.userAchievement.deleteMany() // Прогресс ачивок юзеров
	await prisma.message.deleteMany() // Сообщения (привязаны к Ad и Event)

	// 2. Вторичные сущности
	await prisma.ad.deleteMany()
	await prisma.event.deleteMany()
	await prisma.mapPoint.deleteMany()

	// 3. Справочники
	await prisma.achievement.deleteMany()
	await prisma.waste.deleteMany()

	// 4. Главная сущность
	await prisma.user.deleteMany()

	const passwordHash = await argon2.hash('123456')

	const usersData = [
		{
			name: 'Алексей Иванов',
			email: 'alex@example.com',
			avatar: 'https://github.com/identicons/alex.png'
		},
		{
			name: 'Мария Петрова',
			email: 'maria@example.com',
			avatar: 'https://github.com/identicons/maria.png'
		},
		{
			name: 'Дмитрий Соколов',
			email: 'dima@example.com',
			avatar: 'https://github.com/identicons/dima.png'
		},
		{
			name: 'Елена Смирнова',
			email: 'elena@example.com',
			avatar: 'https://github.com/identicons/elena.png'
		},
		{
			name: 'Иван Кузнецов',
			email: 'ivan@example.com',
			avatar: 'https://github.com/identicons/ivan.png'
		},
		{
			name: 'Анна Новикова',
			email: 'anna@example.com',
			avatar: 'https://github.com/identicons/anna.png'
		},
		{
			name: 'Сергей Морозов',
			email: 'sergey@example.com',
			avatar: 'https://github.com/identicons/sergey.png'
		},
		{
			name: 'Ольга Попова',
			email: 'olga@example.com',
			avatar: 'https://github.com/identicons/olga.png'
		},
		{
			name: 'Андрей Волков',
			email: 'andrey@example.com',
			avatar: 'https://github.com/identicons/andrey.png'
		},
		{
			name: 'Наталья Лебедева',
			email: 'nataly@example.com',
			avatar: 'https://github.com/identicons/nataly.png'
		},
		{
			name: 'Артем Козлов',
			email: 'artem@example.com',
			avatar: 'https://github.com/identicons/artem.png'
		},
		{
			name: 'Татьяна Васильева',
			email: 'tanya@example.com',
			avatar: 'https://github.com/identicons/tanya.png'
		},
		{
			name: 'Михаил Павлов',
			email: 'mike@example.com',
			avatar: 'https://github.com/identicons/mike.png'
		},
		{
			name: 'Юлия Федорова',
			email: 'julia@example.com',
			avatar: 'https://github.com/identicons/julia.png'
		},
		{
			name: 'Константин Степанов',
			email: 'kostya@example.com',
			avatar: 'https://github.com/identicons/kostya.png'
		}
	]

	const users: User[] = []

	for (const u of usersData) {
		const user = await prisma.user.create({
			data: {
				email: u.email,
				name: u.name,
				password: passwordHash,
				avatarUrl: u.avatar,
				rating: Math.floor(Math.random() * 501),
				isEmailVerified: true,
				role: u.email === 'alex@example.com' ? Role.ADMIN : Role.USER
			}
		})
		users.push(user)
	}

	console.log(`✅ Создано ${users.length} пользователей`)

	// --- ОБЪЯВЛЕНИЯ ---
	const adTitles = [
		{
			title: 'Отдам старый фикус',
			type: AdType.GIVEAWAY,
			desc: 'Вырос слишком большой, ищу новый дом.'
		},
		{
			title: 'Мешок пластиковых крышечек',
			type: AdType.RECYCLE,
			desc: 'Собирали всей школой, готовы передать.'
		},
		{
			title: 'Помогу вынести старую мебель',
			type: AdType.NEED_HELP,
			desc: 'Есть свободное время вечером в четверг.'
		},
		{
			title: 'Детская коляска даром',
			type: AdType.GIVEAWAY,
			desc: 'Состояние хорошее, самовывоз.'
		},
		{
			title: 'Сбор батареек в 3 подъезде',
			type: AdType.RECYCLE,
			desc: 'Поставил коробку, потом отвезу в пункт приема.'
		},
		{
			title: 'Нужна помощь с переездом',
			type: AdType.NEED_HELP,
			desc: 'Нужно перетащить коробки на 2 этажа выше.'
		}
	]

	for (let i = 0; i < users.length; i++) {
		const adData = adTitles[i % adTitles.length]
		const generatedSlug = `${slugify(adData.title)}-${Math.random().toString(36).substring(2, 7)}`

		await prisma.ad.create({
			data: {
				title: adData.title,
				slug: generatedSlug,
				description: adData.desc,
				type: adData.type,
				status: Status.ACTIVE,
				authorId: users[i].id,
				phone: '+7 (999) 000-00-00'
			}
		})
	}

	// --- МЕРОПРИЯТИЯ ---
	const eventsData = [
		{
			title: 'Большой субботник в парке',
			cat: EventCategory.CLEANUP,
			loc: 'Центральный парк'
		},
		{
			title: 'Мастер-класс по сортировке',
			cat: EventCategory.WORKSHOP,
			loc: 'Библиотека №4'
		},
		{
			title: 'Фримаркет: обмен одеждой',
			cat: EventCategory.EXCHANGE,
			loc: 'Двор Ленина 15'
		},
		{
			title: 'Эко-лекция: жизнь без пластика',
			cat: EventCategory.OTHER,
			loc: 'Точка кипения'
		}
	]

	for (let i = 0; i < eventsData.length; i++) {
		const baseSlug = slugify(eventsData[i].title)
		const uniqueId = Math.random().toString(36).substring(2, 7)
		const generatedSlug = `${baseSlug}-${uniqueId}`

		const event = await prisma.event.create({
			data: {
				title: eventsData[i].title,
				slug: generatedSlug, // ДОБАВЛЕНО
				description:
					'Приходите всей семьей, будет интересно и полезно для природы!',
				category: eventsData[i].cat,
				location: eventsData[i].loc,
				date: new Date(Date.now() + (i + 1) * 86400000),
				latitude: 55.75 + Math.random() * 0.1,
				longitude: 37.61 + Math.random() * 0.1,
				status: EventStatus.UPCOMING,
				creatorId: users[i].id,
				maxParticipants: 20
			}
		})

		// Добавим случайных участников к мероприятию
		const randomParticipants = users.slice(i + 1, i + 6)
		for (const p of randomParticipants) {
			await prisma.eventParticipant.create({
				data: {
					userId: p.id,
					eventId: event.id
				}
			})
		}
	}
}

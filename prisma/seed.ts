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
    EventStatus 
} from '../prisma/generated/client'
import { UserModel } from './generated/models'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting unified seeding process...')

    // --- 1. ОЧИСТКА БАЗЫ (Снизу вверх) ---
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

    // --- 2. СПРАВОЧНИКИ (Waste & Achievements) ---
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
        { title: 'Электроник', slug: 'battery', description: 'Сдайте 100 батареек.', requirementCount: 100, unit: Unit.THING, category: 'waste', points: 100, iconUrl: '' },
        { title: 'Пластмассовый мир победил', slug: 'plastic', description: 'Сдайте 10кг пластмассы.', requirementCount: 10, unit: Unit.KG, category: 'waste', points: 100, iconUrl: '' },
        { title: 'Бумажный тигр', slug: 'paper', description: 'Сдайте 10кг макулатуры.', requirementCount: 10, unit: Unit.KG, category: 'waste', points: 100, iconUrl: '' },
        { title: 'Эко-активист', slug: 'point', description: 'Добавьте 5 новых точек.', requirementCount: 5, unit: Unit.THING, category: 'map', points: 100, iconUrl: '' },
        { title: 'Доброе сердце', slug: 'giveaway', description: 'Закройте 3 объявления "Отдам даром".', requirementCount: 3, unit: Unit.THING, category: 'ad', points: 100, iconUrl: '' }
    ]

    for (const ach of achievements) {
        await prisma.achievement.create({ data: ach })
    }

    // --- 3. ПОЛЬЗОВАТЕЛИ ---
    console.log('👥 Creating users...')
    const passwordHash = await argon2.hash('123456')
    const usersData = [
        { name: 'Алексей Иванов', email: 'alex@example.com', role: Role.ADMIN },
        { name: 'Мария Петрова', email: 'maria@example.com', role: Role.USER },
        { name: 'Дмитрий Соколов', email: 'dima@example.com', role: Role.USER },
        { name: 'Елена Смирнова', email: 'elena@example.com', role: Role.USER },
        { name: 'Иван Кузнецов', email: 'ivan@example.com', role: Role.USER }
    ]

    const users: UserModel[] = []
    for (const u of usersData) {
        const user = await prisma.user.create({
            data: {
                ...u,
                password: passwordHash,
                rating: Math.floor(Math.random() * 500),
                isEmailVerified: true,
                avatarUrl: `https://github.com/identicons/${u.email.split('@')[0]}.png`
            }
        })
        users.push(user)
    }

    // --- 4. ТОЧКИ НА КАРТЕ ---
    console.log('📍 Creating map points...')
    const allWastes = await prisma.waste.findMany()
    const wasteMap = Object.fromEntries(allWastes.map(w => [w.slug, w.id]))

    const points = [
        { title: 'Контейнер ПЭТ', address: 'ул. Правды, 25', lat: 54.7012, lng: 55.851, type: PointType.CONTAINER, wastes: ['plastic'] },
        { title: 'Пункт приема макулатуры', address: 'ул. Ухтомского, 12', lat: 54.698, lng: 55.855, type: PointType.POINT, wastes: ['paper', 'metal'] },
        { title: 'Эко-бокс для батареек', address: 'ул. Левитана, 14/1', lat: 54.6945, lng: 55.849, type: PointType.CONTAINER, wastes: ['batteries'] }
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
                wasteMapPoints: {
                    create: p.wastes
                        .filter(slug => wasteMap[slug])
                        .map(slug => ({ wasteId: wasteMap[slug] }))
                }
            }
        })
    }

    // --- 5. ОБЪЯВЛЕНИЯ (Ads) ---
    console.log('📢 Creating ads...')
    const adTitles = [
        { title: 'Отдам старый фикус', type: AdType.GIVEAWAY, desc: 'Вырос слишком большой.' },
        { title: 'Мешок крышечек', type: AdType.RECYCLE, desc: 'Готовы передать.' },
        { title: 'Нужна помощь с переездом', type: AdType.NEED_HELP, desc: 'Нужно перетащить коробки.' }
    ]

    for (let i = 0; i < users.length; i++) {
        const data = adTitles[i % adTitles.length]
        await prisma.ad.create({
            data: {
                title: data.title,
                slug: `${slugify(data.title)}-${Math.random().toString(36).substring(2, 7)}`,
                description: data.desc,
                type: data.type,
                status: Status.ACTIVE,
                authorId: users[i].id,
                phone: '+7 (999) 000-00-00'
            }
        })
    }

    // --- 6. МЕРОПРИЯТИЯ (Events) ---
    console.log('📅 Creating events...')
    const eventsData = [
        { title: 'Субботник в парке', cat: EventCategory.CLEANUP },
        { title: 'Мастер-класс по сортировке', cat: EventCategory.WORKSHOP }
    ]

    for (let i = 0; i < eventsData.length; i++) {
        const event = await prisma.event.create({
            data: {
                title: eventsData[i].title,
                slug: `${slugify(eventsData[i].title)}-${Math.random().toString(36).substring(2, 7)}`,
                description: 'Полезное мероприятие для всех.',
                category: eventsData[i].cat,
                location: 'Городской парк',
                date: new Date(Date.now() + 86400000),
                latitude: 54.7,
                longitude: 55.8,
                creatorId: users[i].id,
                status: EventStatus.UPCOMING
            }
        })

        // Добавляем участников
        await prisma.eventParticipant.create({
            data: { userId: users[(i + 1) % users.length].id, eventId: event.id }
        })
    }

    console.log('✅ Seeding finished successfully.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        await pool.end()
        process.exit(1)
    })
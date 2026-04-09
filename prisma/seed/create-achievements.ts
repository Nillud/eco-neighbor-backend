import { PrismaClient, Unit } from "prisma/generated/client"

export const createAchievementsData = async (prisma: PrismaClient) => {
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
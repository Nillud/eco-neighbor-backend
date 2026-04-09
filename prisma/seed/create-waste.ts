import { PrismaClient } from "prisma/generated/client"

export const createWasteData = async (prisma: PrismaClient) => {
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
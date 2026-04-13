import { PrismaClient } from 'prisma/generated/client'
import { slugify } from 'transliteration'

export const fixAllSlugs = async (prisma: PrismaClient) => {
	const ads = await prisma.ad.findMany()

	console.log(`Найдено ${ads.length} объявлений для обновления...`)

	for (const ad of ads) {
		const baseSlug = slugify(ad.title)
		const uniqueId = ad.id.slice(-5)
		const newSlug = `${baseSlug}-${uniqueId}`

		await prisma.ad.update({
			where: { id: ad.id },
			data: { slug: newSlug }
		})
		console.log(`Обновлено: ${ad.title} -> ${newSlug}`)
	}

	const events = await prisma.event.findMany()
	console.log(`Найдено ${events.length} мероприятий для обновления...`)
	for (const event of events) {
		const baseSlug = slugify(event.title)
		const uniqueId = event.id.slice(-5)
		const newSlug = `${baseSlug}-${uniqueId}`

		await prisma.event.update({
			where: { id: event.id },
			data: { slug: newSlug, updatedAt: new Date() }
		})
		console.log(`Обновлено мероприятие: ${event.title} -> ${newSlug}`)
	}
}

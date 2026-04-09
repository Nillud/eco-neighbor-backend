import { PrismaClient } from 'prisma/generated/client'
import { slugify } from 'transliteration'

export const fixSlug = async (prisma: PrismaClient) => {
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
}

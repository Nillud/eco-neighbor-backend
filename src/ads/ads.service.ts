/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException
} from '@nestjs/common'
import { slugify } from 'transliteration'
import { PrismaService } from 'src/prisma/prisma.service'
import { AchievementsService } from 'src/achievements/achievements.service'
import { CreateAdDto } from './dto/create-ad.dto'
import { AdType, Status } from 'prisma/generated/enums'

@Injectable()
export class AdsService {
	constructor(
		private prisma: PrismaService,
		private achievementsService: AchievementsService
	) {}

	async create(userId: string, dto: CreateAdDto) {
		const baseSlug = slugify(dto.title)
		const uniqueId = Math.random().toString(36).substring(2, 7)
		const slug = `${baseSlug}-${uniqueId}`

		return this.prisma.ad.create({
			data: {
				...dto,
				slug,
				authorId: userId
			} as any
		})
	}

	async getBySlug(slug: string) {
		console.log(slug)
		const ad = await this.prisma.ad.findUnique({
			where: { slug } as any,
			include: {
				author: {
					select: {
						id: true,
						name: true,
						avatarUrl: true,
						rating: true
					}
				}
			}
		})

		if (!ad) throw new NotFoundException('Объявление не найдено')
		return ad
	}

	async getAll(type?: AdType) {
		return this.prisma.ad.findMany({
			where: {
				status: Status.ACTIVE,
				...(type ? { type } : {})
			},
			include: { author: { select: { name: true, avatarUrl: true } } },
			orderBy: { createdAt: 'desc' }
		})
	}

	async update(userId: string, adId: string, dto: Partial<CreateAdDto>) {
		const ad = await this.prisma.ad.findUnique({ where: { id: adId } })

		if (!ad) throw new NotFoundException('Объявление не найдено')
		if (ad.authorId !== userId) throw new ForbiddenException('Вы не автор')

		const updateData: Partial<CreateAdDto> = { ...dto }

		// Если заголовок изменился, обновляем slug
		if (dto.title && dto.title !== ad.title) {
			const baseSlug = slugify(dto.title)
			const uniqueId = ad.id.slice(-5)
			updateData.slug = `${baseSlug}-${uniqueId}`
		}

		return this.prisma.ad.update({
			where: { id: adId },
			data: updateData
		})
	}

	/**
	 * ЗАКРЫТИЕ ОБЪЯВЛЕНИЯ
	 * В этот момент начисляются баллы и проверяются ачивки
	 */
	async closeAd(userId: string, adId: string) {
		const ad = await this.prisma.ad.findUnique({ where: { id: adId } })

		if (!ad) throw new NotFoundException('Объявление не найдено')
		if (ad.authorId !== userId)
			throw new ForbiddenException('Это не ваше объявление')
		if (ad.status === Status.CLOSED)
			throw new BadRequestException('Объявление уже закрыто')

		return await this.prisma.$transaction(async () => {
			const updatedAd = await this.prisma.ad.update({
				where: { id: adId },
				data: { status: Status.CLOSED }
			})

			if (ad.type === AdType.GIVEAWAY) {
				await this.achievementsService.updateProgress(userId, 'giveaway', 1)
			}

			await this.prisma.user.update({
				where: { id: userId },
				data: { rating: { increment: 15 } }
			})

			return updatedAd
		})
	}

	async remove(userId: string, adId: string) {
		const ad = await this.prisma.ad.findUnique({ where: { id: adId } })
		if (ad?.authorId !== userId) throw new ForbiddenException()

		await this.prisma.user.update({
			where: { id: userId },
			data: { rating: { decrement: 15 } }
		})

		return this.prisma.ad.delete({ where: { id: adId } })
	}
}

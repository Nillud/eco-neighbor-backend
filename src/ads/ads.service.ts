import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException
} from '@nestjs/common'
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
		await this.prisma.user.update({
			where: { id: userId },
			data: { rating: { increment: 15 } }
		})

		return this.prisma.ad.create({
			data: {
				...dto,
				authorId: userId
			}
		})
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

			return updatedAd
		})
	}

	async remove(userId: string, adId: string) {
		const ad = await this.prisma.ad.findUnique({ where: { id: adId } })
		if (ad?.authorId !== userId) throw new ForbiddenException()

		return this.prisma.ad.delete({ where: { id: adId } })
	}
}

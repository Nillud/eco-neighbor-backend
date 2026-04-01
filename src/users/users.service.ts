import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ECO_LEVELS, getLevelByScore } from './utils/eco-levels.util'
import { AchievementsService } from 'src/achievements/achievements.service'

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly achievementsService: AchievementsService
	) {}

	getAll() {
		return this.prisma.user.findMany()
	}

	getLeaderboard() {
		return this.prisma.user.findMany({
			where: {
				rating: { gt: 0 }
			},
			select: {
				id: true,
				name: true,
				avatarUrl: true,
				rating: true,
				achievements: true,
				_count: {
					select: { achievements: { where: { isUnlocked: true } } }
				}
			},
			orderBy: { rating: 'desc' },
			take: 10
		})
	}

	findById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
		})
	}

	async findByEmail(email: string) {
		return await this.prisma.user.findFirst({
			where: {
				email: {
					equals: email,
					mode: 'insensitive'
				}
			}
		})
	}

	async getProfile(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				rating: true,
				role: true
			}
		})

		if (!user) throw new NotFoundException('Пользователь не найден')
		return user
	}

	async getFullProfile(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				rating: true,
				role: true,
				createdAt: true,
				achievements: {
					where: { isUnlocked: true },
					include: { achievement: true },
					take: 5
				}
			}
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		// Твой текущий рейтинг — это и есть ecoScore
		const ecoScore = user.rating

		const currentLevel = getLevelByScore(ecoScore)
		const nextLevelIndex =
			ECO_LEVELS.findIndex(l => l.name === currentLevel.name) + 1
		const nextLevel = ECO_LEVELS[nextLevelIndex] || null

		return {
			...user,
			ecoScore,
			level: {
				current: currentLevel.name,
				color: currentLevel.color,
				nextLevelName: nextLevel?.name || 'Максимум',
				pointsToNext: nextLevel ? nextLevel.minScore - ecoScore : 0,
				progressPercentage: nextLevel
					? Math.round((ecoScore / nextLevel.minScore) * 100)
					: 100
			}
		}
	}

	async delete(id: string) {
		return await this.prisma.user.delete({ where: { id } })
	}

	async addPoints(
		userId: string,
		dto: { amount: number; values: Record<string, number> }
	) {
		const calculatedSum = Object.values(dto.values).reduce((a, b) => a + b, 0)
		const finalAmount = Math.min(calculatedSum, 100)

		return this.prisma.$transaction(async tx => {
			// 2. Обновляем прогресс ачивок для каждого типа мусора
			for (const [slug, value] of Object.entries(dto.values)) {
				if (value > 0) {
					await this.achievementsService.updateProgress(
						userId,
						slug,
						Math.min(value, 100)
					)
				}
			}

			// 3. Начисляем общий рейтинг пользователю
			return tx.user.update({
				where: { id: userId },
				data: {
					rating: { increment: finalAmount }
				}
			})
		})
	}
}

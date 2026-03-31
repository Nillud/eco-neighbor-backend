import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ECO_LEVELS, getLevelByScore } from './utils/eco-levels.util'

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

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

	async getFullProfile(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				rating: true, // Наш ecoScore
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
}

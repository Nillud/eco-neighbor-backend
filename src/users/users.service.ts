import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ECO_LEVELS, getLevelByScore } from './utils/eco-levels.util'
import { AchievementsService } from 'src/achievements/achievements.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { hash, verify } from 'argon2'

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly achievementsService: AchievementsService
	) {}

	getAll() {
		return this.prisma.user.findMany()
	}

	async getLeaderboard(userId?: string) {
		console.log(userId)
		// 1. Получаем ТОП-10 (доступно всем)
		const topUsers = await this.prisma.user.findMany({
			where: { rating: { gt: 0 } },
			select: {
				id: true,
				name: true,
				avatarUrl: true,
				rating: true,
				_count: {
					select: { achievements: { where: { isUnlocked: true } } }
				}
			},
			orderBy: { rating: 'desc' },
			take: 10
		})

		const usersWithRank = topUsers.map((user, index) => ({
			...user,
			rank: index + 1
		}))

		// 2. Логика для авторизованного пользователя
		let currentUser: {
			id: string
			name: string
			avatarUrl: string | null
			rating: number
			rank: number
			_count: { achievements: number }
		} | null = null

		if (userId) {
			const isUserInTop = usersWithRank.some(u => u.id === userId)

			if (!isUserInTop) {
				const userStats = await this.prisma.user.findUnique({
					where: { id: userId },
					select: {
						id: true,
						name: true,
						avatarUrl: true,
						rating: true,
						_count: {
							select: { achievements: { where: { isUnlocked: true } } }
						}
					}
				})

				if (userStats) {
					const rank = await this.prisma.user.count({
						where: { rating: { gt: userStats.rating } }
					})
					currentUser = { ...userStats, rank: rank + 1 }
				}
			}
		}

		return { topUsers: usersWithRank, currentUser }
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
		// 1. Получаем данные пользователя и все ачивки из базы одним запросом (или двумя параллельными)
		const [user, allAchievements] = await Promise.all([
			this.prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					email: true,
					name: true,
					avatarUrl: true,
					rating: true,
					role: true,
					createdAt: true,
					// Тянем прогресс по ачивкам для этого юзера
					achievements: {
						select: {
							achievementId: true,
							currentValue: true,
							isUnlocked: true,
							earnedAt: true
						}
					}
				}
			}),
			this.prisma.achievement.findMany() // Все доступные ачивки в системе
		])

		if (!user) throw new NotFoundException('Пользователь не найден')

		// 2. Формируем полный список ачивок с прогрессом пользователя
		const achievementsWithProgress = allAchievements.map(achievement => {
			// Ищем, есть ли у пользователя запись о прогрессе этой ачивки
			const userProgress = user.achievements.find(
				ua => ua.achievementId === achievement.id
			)

			const currentValue = userProgress?.currentValue || 0
			const isUnlocked = userProgress?.isUnlocked || false

			return {
				...achievement,
				currentValue,
				isUnlocked,
				earnedAt: userProgress?.earnedAt || null,
				// Высчитываем процент прогресса для фронтенда
				progressPercentage: Math.min(
					Math.round((currentValue / achievement.requirementCount) * 100),
					100
				)
			}
		})

		// 3. Расчет уровней (оставляем твою логику)
		const ecoScore = user.rating
		const currentLevel = getLevelByScore(ecoScore)
		const nextLevelIndex =
			ECO_LEVELS.findIndex(l => l.name === currentLevel.name) + 1
		const nextLevel = ECO_LEVELS[nextLevelIndex] || null

		// 4. Собираем финальный объект
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			avatarUrl: user.avatarUrl,
			rating: user.rating,
			role: user.role,
			createdAt: user.createdAt,
			ecoScore,
			achievements: achievementsWithProgress, // Теперь здесь все ачивки с прогрессом
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

	async getAdminStats() {
		const [
			usersCount,
			eventsCount,
			adsCount,
			pointsCount,
			unverifiedPointsCount,
			totalWasteValue // Если есть логи сбора, иначе убираем
		] = await Promise.all([
			this.prisma.user.count(),
			this.prisma.event.count(),
			this.prisma.ad.count(),
			this.prisma.mapPoint.count(),
			this.prisma.mapPoint.count({ where: { isVerified: false } }),
			// Предположим, у вас есть логи сбора, если нет - этот пункт пропустить
			this.prisma.userAchievement.aggregate({
				_sum: { currentValue: true }
			})
		])

		return {
			users: {
				total: usersCount
				// Можно добавить прирост за неделю
			},
			events: {
				total: eventsCount,
				active: await this.prisma.event.count({ where: { status: 'UPCOMING' } })
			},
			ads: {
				total: adsCount,
				active: await this.prisma.ad.count({ where: { status: 'ACTIVE' } })
			},
			map: {
				totalPoints: pointsCount,
				needsVerification: unverifiedPointsCount // Важно для админа!
			},
			ecoImpact: {
				totalPointsAwarded: totalWasteValue._sum.currentValue || 0
			}
		}
	}

	async getActivity(userId: string) {
		const [participating, created, ads] = await Promise.all([
			// Те, где юзер в списке участников
			this.prisma.event.findMany({
				where: { participants: { some: { userId } } },
				include: { creator: true, _count: { select: { participants: true } } }
			}),
			// Те, которые юзер создал сам
			this.prisma.event.findMany({
				where: { creatorId: userId },
				include: { creator: true, _count: { select: { participants: true } } }
			}),
			// Объявления пользователя
			this.prisma.ad.findMany({
				where: { authorId: userId },
				orderBy: { createdAt: 'desc' },
				include: { author: true }
			})
		])

		return { participating, created, ads }
	}

	async changePassword(userId: string, dto: ChangePasswordDto) {
		// 1. Ищем пользователя
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		// 2. Проверяем, совпадает ли старый пароль
		const isValid = await verify(user.password, dto.oldPassword)

		if (!isValid) {
			throw new BadRequestException('Старый пароль указан неверно')
		}

		// 3. Проверяем, не совпадает ли новый пароль со старым (опционально, но полезно)
		if (dto.oldPassword === dto.newPassword) {
			throw new BadRequestException('Новый пароль не может совпадать со старым')
		}

		// 4. Хешируем новый пароль и сохраняем
		const hashedPassword = await hash(dto.newPassword)

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				password: hashedPassword
			}
		})

		return { message: 'Пароль успешно изменен' }
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
			// Обновляем прогресс ачивок для каждого типа мусора
			for (const [slug, value] of Object.entries(dto.values)) {
				if (value > 0) {
					await this.achievementsService.updateProgress(
						userId,
						slug,
						Math.min(value, 100),
						tx
					)
				}
			}

			// Начисляем общий рейтинг пользователю
			return tx.user.update({
				where: { id: userId },
				data: {
					rating: { increment: finalAmount }
				}
			})
		})
	}
}

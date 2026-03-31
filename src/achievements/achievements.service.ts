/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateAchievementDto } from './dto/create-achievement.dto'
import { NotificationsGateway } from 'src/notifications/notifications.gateway'

@Injectable()
export class AchievementsService {
	constructor(
		private prisma: PrismaService,
		private notificationsGateway: NotificationsGateway
	) {}

	async create(dto: CreateAchievementDto) {
		return this.prisma.achievement.create({ data: dto })
	}

	async getAll() {
		return this.prisma.achievement.findMany({
			include: { _count: { select: { userAchievements: true } } }
		})
	}

	async update(id: string, dto: CreateAchievementDto) {
		return this.prisma.achievement.update({
			where: { id },
			data: dto
		})
	}

	async delete(id: string) {
		await this.prisma.userAchievement.deleteMany({
			where: { achievementId: id }
		})
		return this.prisma.achievement.delete({ where: { id } })
	}

	async updateProgress(userId: string, slug: string, amount: number) {
		const achievement = await this.prisma.achievement.findUnique({
			where: { slug }
		})
		if (!achievement) return

		// 1. Инкрементируем базовый рейтинг пользователя за само действие (1 ед = 1 балл)
		// Используем поле rating, которое у тебя уже есть в модели User
		await this.prisma.user.update({
			where: { id: userId },
			data: { rating: { increment: Math.floor(amount) } } // Используем Floor, если передали Float
		})

		const userAch = await this.prisma.userAchievement.upsert({
			where: {
				userId_achievementId: { userId, achievementId: achievement.id }
			},
			update: { currentValue: { increment: amount } },
			create: { userId, achievementId: achievement.id, currentValue: amount }
		})

		// 2. Проверка на закрытие ачивки (бонусные баллы)
		if (
			!userAch.isUnlocked &&
			userAch.currentValue >= achievement.requirementCount
		) {
			await this.prisma.userAchievement.update({
				where: { id: userAch.id },
				data: { isUnlocked: true, earnedAt: new Date() }
			})

			// Начисляем бонусные очки ачивки в общий рейтинг
			await this.prisma.user.update({
				where: { id: userId },
				data: { rating: { increment: achievement.points } }
			})

			// Уведомление через сокет
			this.notificationsGateway.sendAchievementUpdate(userId, {
				type: 'ACHIEVEMENT_UNLOCKED',
				title: achievement.title,
				bonusPoints: achievement.points,
				slug: achievement.slug
			})
		}
	}

	async getUserProfileAchievements(userId: string) {
		return this.prisma.userAchievement.findMany({
			where: { userId },
			include: { achievement: true },
			orderBy: { earnedAt: 'desc' }
		})
	}
}

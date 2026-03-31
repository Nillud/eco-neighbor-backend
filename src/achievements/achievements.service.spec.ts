/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing'
import { AchievementsService } from './achievements.service'
import { PrismaService } from 'src/prisma/prisma.service'

describe('AchievementsService', () => {
	let service: AchievementsService
	let prisma: PrismaService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AchievementsService,
				{
					provide: PrismaService,
					useValue: {
						achievement: { findMany: jest.fn() },
						userAchievement: { upsert: jest.fn(), update: jest.fn() }
					}
				}
			]
		}).compile()

		service = module.get<AchievementsService>(AchievementsService)
		prisma = module.get<PrismaService>(PrismaService)
	})

	it('должен корректно обновлять прогресс пользователя', async () => {
		// Мокаем ответ от БД: ачивка требует 5 действий
		;(prisma.achievement.findMany as jest.Mock).mockResolvedValue([
			{
				id: '1',
				title: 'Тест',
				requirementCount: 5,
				category: 'TEST'
			}
		])

		// Мокаем текущий прогресс: у юзера стало 5
		;(prisma.userAchievement.upsert as jest.Mock).mockResolvedValue({
			id: 'ua1',
			isUnlocked: false,
			currentValue: 5
		})

		await service.updateProgress('user1', 'TEST', 1)

		// Проверяем, что вызвалось обновление статуса на isUnlocked: true
		expect(prisma.userAchievement.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ isUnlocked: true })
			})
		)
	})
})

import { Test, TestingModule } from '@nestjs/testing'
import { AdsService } from './ads.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { AchievementsService } from 'src/achievements/achievements.service'

describe('AdsService', () => {
	let service: AdsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AdsService,
				{
					provide: PrismaService,
					useValue: {
						ad: {
							create: jest.fn(),
							findMany: jest.fn(),
							findUnique: jest.fn(),
							update: jest.fn(),
							delete: jest.fn()
						}
					}
				},
				{
					provide: AchievementsService,
					useValue: {
						updateProgress: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<AdsService>(AdsService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'

jest.mock('./../src/media-upload/media-upload.service.ts', () => ({
	MediaUploadService: class {
		uploadFile = jest.fn().mockResolvedValue({ url: 'http://fake.com' })
	}
}))

jest.mock('./../src/email/email.service.ts', () => ({
	EmailService: class {
		sendVerificationEmail = jest.fn().mockResolvedValue(true)
		sendResetPasswordEmail = jest.fn().mockResolvedValue(true)
	}
}))

import { AppModule } from './../src/app.module'
import { EmailService } from 'src/email/email.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { MediaUploadService } from 'src/media-upload/media-upload.service'

describe('AppController (e2e)', () => {
	let app: INestApplication<App>

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		})
			.overrideProvider(PrismaService)
			.useValue({
				$connect: jest.fn().mockResolvedValue(true),
				$disconnect: jest.fn().mockResolvedValue(true),
				onModuleInit: jest.fn().mockResolvedValue(true),
				onModuleDestroy: jest.fn().mockResolvedValue(true)
			})
			.overrideProvider(EmailService)
			.useValue({
				sendVerificationEmail: jest.fn().mockResolvedValue(true),
				sendResetPasswordEmail: jest.fn().mockResolvedValue(true)
			})
			.overrideProvider(MediaUploadService)
			.useValue({
				uploadFile: jest.fn()
			})
			.compile()

		app = moduleFixture.createNestApplication()
		app.setGlobalPrefix('api')
		await app.init()
	})

	it('/api (GET)', () => {
		return request(app.getHttpServer())
			.get('/api')
			.expect(res => {
				// Проверяем, что сервер хотя бы ответил, а не упал с ошибкой модулей
				expect([200, 404]).toContain(res.status)
			})
	})

	afterAll(async () => {
		await app.close()
	})
})

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { join } from 'node:path'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	app.setGlobalPrefix('api')

	app.use(cookieParser())

	app.enableCors({
		origin: ['http://localhost:3000'],
		credentials: true
	})

	app.disable('x-powered-by')

	const config = new DocumentBuilder()
		.setTitle('EcoNeighbor API')
		.setDescription('Документация для фронтенда эко-платформы')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Введите accessToken для работы запроса',
				in: 'header'
			},
			'access-token' // Это имя должно совпадать с тем, что мы укажем в декораторе
		)
		.addCookieAuth('accessToken', {
			type: 'apiKey',
			in: 'cookie',
			name: 'accessToken'
		})
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document) // Путь будет /api/docs

	app.useStaticAssets(join(__dirname, '..', 'uploads'), {
		prefix: '/uploads/'
	})

	await app.listen(process.env.PORT ?? 4200)
}
void bootstrap()

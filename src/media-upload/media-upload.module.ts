/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common'
import { MediaUploadService } from './media-upload.service'
import { MediaUploadController } from './media-upload.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { path } from 'app-root-path'

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: `${path}/uploads`,
			serveRoot: '/uploads'
		})
	],
	providers: [MediaUploadService],
	controllers: [MediaUploadController]
})
export class MediaUploadModule {}

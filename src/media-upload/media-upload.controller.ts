import {
	Controller,
	HttpCode,
	Post,
	Query,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { MediaUploadService } from './media-upload.service'

@Controller('media-upload')
export class MediaUploadController {
	constructor(private readonly mediaService: MediaUploadService) {}

	@HttpCode(200)
	@Post()
	@Auth()
	@UseInterceptors(
		FileInterceptor('file', {
			limits: { fileSize: 5 * 1024 * 1024 }
		})
	)
	async uploadImage(
		@UploadedFile() file: Express.Multer.File,
		@Query('folder') folder?: string
	) {
		const uploaded = await this.mediaService.uploadImage(file, folder)
		return uploaded
	}
}

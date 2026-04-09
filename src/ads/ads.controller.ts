import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query
} from '@nestjs/common'
import { CreateAdDto } from './dto/create-ad.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { AdsService } from './ads.service'
import { AdType } from 'prisma/generated/enums'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
	constructor(private readonly adsService: AdsService) {}

	@Post()
	@ApiBearerAuth('access-token')
	@Auth()
	@ApiOperation({ summary: 'Создать объявление (требуется JWT)' })
	create(@CurrentUser('id') userId: string, @Body() dto: CreateAdDto) {
		return this.adsService.create(userId, dto)
	}

	@Get()
	findAll(@Query('type') type?: AdType) {
		return this.adsService.getAll(type)
	}

	@Get('by-slug/:slug')
	@ApiOperation({ summary: 'Получить объявление по слагу' })
	getBySlug(@Param('slug') slug: string) {
		return this.adsService.getBySlug(slug)
	}

	@Patch(':id/close')
	@Auth()
	close(@CurrentUser('id') userId: string, @Param('id') id: string) {
		return this.adsService.closeAd(userId, id)
	}

	@Delete(':id')
	@ApiBearerAuth('access-token')
	@Auth()
	@ApiOperation({ summary: 'Удалить объявление (только ADMIN)' })
	remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
		return this.adsService.remove(userId, id)
	}
}

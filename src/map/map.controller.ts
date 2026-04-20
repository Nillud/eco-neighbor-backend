import {
	Controller,
	Get,
	Post,
	Body,
	Delete,
	Param,
	Query,
	ParseArrayPipe,
	Patch,
	Put
} from '@nestjs/common'
import { MapService } from './map.service'
import { CreateMapPointDto } from './dto/create-map-point.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Role } from 'prisma/generated/enums'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import type { UserModel } from 'prisma/generated/models'

@Controller('map-points')
export class MapController {
	constructor(private readonly mapService: MapService) {}

	@Get()
	findAll(
		@Query(
			'types',
			new ParseArrayPipe({ items: String, separator: ',', optional: true })
		)
		types?: string[]
	) {
		return this.mapService.getAll(types)
	}

	@Get('pending')
	@Auth(Role.ADMIN)
	getPendingPoints() {
		return this.mapService.getPendingPoints()
	}

	@Get(':id')
	@Auth(Role.ADMIN)
	getById(@Param('id') id: string) {
		return this.mapService.getById(id)
	}

	@Post()
	@Auth()
	create(@Body() dto: CreateMapPointDto, @CurrentUser() author: UserModel) {
		return this.mapService.create(dto, author)
	}

	@Patch(':id/verify')
	@Auth(Role.ADMIN)
	verifyPoint(@Param('id') id: string) {
		return this.mapService.verifyPoint(id)
	}

	@Put(':id') // Не забудь импортировать Put из @nestjs/common
	@Auth(Role.ADMIN) // Пока оставляем для админов
	update(@Param('id') id: string, @Body() dto: CreateMapPointDto) {
		return this.mapService.update(id, dto)
	}

	@Delete(':id')
	@Auth(Role.ADMIN)
	delete(@Param('id') id: string) {
		return this.mapService.delete(id)
	}
}

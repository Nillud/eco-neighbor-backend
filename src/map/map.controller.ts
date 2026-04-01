import { Controller, Get, Post, Body, Delete, Param, Query, ParseArrayPipe } from '@nestjs/common'
import { MapService } from './map.service'
import { CreateMapPointDto } from './dto/create-map-point.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Role } from 'prisma/generated/enums'

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

	@Post()
	@Auth(Role.ADMIN)
	create(@Body() dto: CreateMapPointDto & { authorId: string | null }) {
		return this.mapService.create(dto)
	}

	@Delete(':id')
	@Auth(Role.ADMIN)
	delete(@Param('id') id: string) {
		return this.mapService.delete(id)
	}
}

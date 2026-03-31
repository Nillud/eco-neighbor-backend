import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common'
import { MapService } from './map.service'
import { CreateMapPointDto } from './dto/create-map-point.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Role } from 'prisma/generated/enums'

@Controller('map-points')
export class MapController {
	constructor(private readonly mapService: MapService) {}

	@Get()
	findAll() {
		return this.mapService.findAll()
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

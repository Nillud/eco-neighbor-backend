import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { WasteService } from './waste.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Role } from 'prisma/generated/enums'
import { CreateWasteDto } from './dto/create-waste.dto'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

@Controller('waste')
export class WasteController {
	constructor(private readonly wasteService: WasteService) {}

	@Get()
	findAll() {
		return this.wasteService.findAll()
	}

	@Post()
	@Auth(Role.ADMIN)
	@ApiOperation({ summary: 'Создать объявление' })
	@ApiResponse({ status: 201, description: 'Успешно создано' })
	create(@Body() { name }: CreateWasteDto) {
		return this.wasteService.create(name)
	}

	@Delete(':id')
	@Auth(Role.ADMIN)
	remove(@Param('id') id: string) {
		return this.wasteService.delete(id)
	}
}

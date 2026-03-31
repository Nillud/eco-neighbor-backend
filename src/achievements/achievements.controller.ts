// src/achievements/achievements.controller.ts
import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
    Put
} from '@nestjs/common'
import { AchievementsService } from './achievements.service'
import { CreateAchievementDto } from './dto/create-achievement.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { Role } from 'prisma/generated/enums'

@Controller('achievements')
export class AchievementsController {
	constructor(private readonly achievementsService: AchievementsService) {}

	@Get('my')
	@Auth()
	getMyAchievements(@CurrentUser('id') userId: string) {
		return this.achievementsService.getUserProfileAchievements(userId)
	}

	@Get()
	getAll() {
		return this.achievementsService.getAll()
	}

	// --- ADMIN ONLY ---

	@Post()
	@Auth(Role.ADMIN)
	create(@Body() dto: CreateAchievementDto) {
		return this.achievementsService.create(dto)
	}

	@Put(':id')
	@Auth(Role.ADMIN)
	update(@Param('id') id: string, @Body() dto: CreateAchievementDto) {
		return this.achievementsService.update(id, dto)
	}

	@Delete(':id')
	@Auth(Role.ADMIN)
	delete(@Param('id') id: string) {
		return this.achievementsService.delete(id)
	}
}

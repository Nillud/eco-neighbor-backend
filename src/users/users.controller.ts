import {
	Controller,
	Get,
	Param,
	Delete,
	NotFoundException,
	Post,
	Body,
	HttpCode,
	Patch
} from '@nestjs/common'
import { UsersService } from './users.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { Role } from 'prisma/generated/enums'
import { ChangePasswordDto } from './dto/change-password.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('leaderboard')
	@Auth()
	async getLeaderboard(@CurrentUser('id') userId?: string) {
		return this.usersService.getLeaderboard(userId)
	}

	/**
	 * ЛИЧНЫЙ ПРОФИЛЬ
	 * GET /api/users/full-profile
	 * Доступен любому авторизованному пользователю
	 */
	@Get('profile')
	@Auth()
	async getProfile(@CurrentUser('id') userId: string) {
		return this.usersService.getProfile(userId)
	}

	@Get('full-profile')
	@Auth()
	async getFullProfile(@CurrentUser('id') userId: string) {
		return this.usersService.getFullProfile(userId)
	}

	@Get('admin-stats')
	@Auth('ADMIN')
	async getAdminStats() {
		return this.usersService.getAdminStats()
	}

	@Get('get-activity')
	@Auth()
	async getActivity(@CurrentUser('id') userId: string) {
		return this.usersService.getActivity(userId)
	}

	/**
	 * ВСЕ ПОЛЬЗОВАТЕЛИ (ADMIN ONLY)
	 * GET /api/users
	 * Для списка пользователей в админ-панели
	 */
	@Get()
	@Auth(Role.ADMIN)
	async getAll() {
		return this.usersService.getAll()
	}

	/**
	 * ПОИСК ПО ID (ADMIN ONLY)
	 * GET /api/users/:id
	 */
	@Get(':id')
	@Auth(Role.ADMIN)
	async findOne(@Param('id') id: string) {
		const user = await this.usersService.findById(id)
		if (!user) throw new NotFoundException('Пользователь не найден')
		return user
	}

	@HttpCode(200)
	@Patch('profile/change-password')
	@Auth()
	async changePassword(
		@CurrentUser('id') userId: string,
		@Body() dto: ChangePasswordDto
	) {
		return this.usersService.changePassword(userId, dto)
	}

	/**
	 * УДАЛЕНИЕ (ADMIN ONLY)
	 * DELETE /api/users/:id
	 */
	@Delete(':id')
	@Auth(Role.ADMIN)
	async delete(@Param('id') id: string) {
		return this.usersService.delete(id)
	}

	@Post('collect-waste')
	@Auth()
	async collectWaste(
		@CurrentUser('id') userId: string,
		@Body() dto: { amount: number; values: Record<string, number> }
	) {
		return await this.usersService.addPoints(userId, dto)
	}
}

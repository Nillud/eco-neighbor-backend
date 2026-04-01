import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AchievementsModule } from 'src/achievements/achievements.module'

@Module({
	imports: [PrismaModule, AchievementsModule],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService]
})
export class UsersModule {}

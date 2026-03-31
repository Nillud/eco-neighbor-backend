import { Module } from '@nestjs/common'
import { AdsService } from './ads.service'
import { AdsController } from './ads.controller'
import { AchievementsModule } from 'src/achievements/achievements.module'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
	imports: [PrismaModule, AchievementsModule],
	providers: [AdsService],
	controllers: [AdsController]
})
export class AdsModule {}

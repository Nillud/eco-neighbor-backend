import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AchievementsModule } from 'src/achievements/achievements.module'

@Module({
	imports: [PrismaModule, AchievementsModule],
	providers: [EventsService],
	controllers: [EventsController]
})
export class EventsModule {}

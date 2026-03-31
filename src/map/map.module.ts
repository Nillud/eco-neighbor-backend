import { Module } from '@nestjs/common'
import { MapService } from './map.service'
import { MapController } from './map.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
	imports: [PrismaModule],
	providers: [MapService],
	controllers: [MapController]
})
export class MapModule {}

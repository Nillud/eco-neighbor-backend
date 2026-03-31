import { Module } from '@nestjs/common'
import { WasteService } from './waste.service'
import { WasteController } from './waste.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
	imports: [PrismaModule],
	providers: [WasteService],
	controllers: [WasteController]
})
export class WasteModule {}

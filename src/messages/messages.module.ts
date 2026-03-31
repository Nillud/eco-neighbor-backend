import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { NotificationsModule } from 'src/notifications/notifications.module'

@Module({
	imports: [PrismaModule, NotificationsModule],
	providers: [MessagesService],
	controllers: [MessagesController]
})
export class MessagesModule {}

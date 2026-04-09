import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
	constructor(private readonly messagesService: MessagesService) {}

	@Get('chats')
	@Auth()
	async getChatList(@CurrentUser('id') userId: string) {
		return this.messagesService.getChatList(userId)
	}
	// Получение истории: GET /messages?adId=... или GET /messages?eventId=...
	@Get()
	@Auth()
	async getChatHistory(
		@CurrentUser('id') userId: string,
		@Query('adId') adId?: string,
		@Query('eventId') eventId?: string,
		@Query('participantId') participantId?: string
	) {
		return this.messagesService.getHistory(userId, {
			adId,
			eventId,
			participantId
		})
	}

	// Отправка через POST (удобно для вложений или простого текста)
	@Post()
	@Auth()
	async sendMessage(
		@CurrentUser('id') userId: string,
		@Body()
		dto: {
			text: string
			adId?: string
			eventId?: string
			receiverId?: string
		}
	) {
		return this.messagesService.saveMessage(userId, dto)
	}
}

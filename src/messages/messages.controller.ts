import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    // Получение истории: GET /messages?adId=... или GET /messages?eventId=...
    @Get()
    getChatHistory(
        @Query('adId') adId?: string,
        @Query('eventId') eventId?: string
    ) {
        return this.messagesService.getHistory({ adId, eventId })
    }

    // Отправка через POST (удобно для вложений или простого текста)
    @Post()
    sendMessage(
        @CurrentUser('id') userId: string,
        @Body() dto: { text: string; adId?: string; eventId?: string }
    ) {
        return this.messagesService.saveMessage(userId, dto)
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotificationsGateway } from 'src/notifications/notifications.gateway'

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway
    ) {}

    async saveMessage(
        userId: string,
        dto: { text: string; adId?: string; eventId?: string }
    ) {
        if (!dto.adId && !dto.eventId) {
            throw new BadRequestException(
                'Не указан идентификатор чата (adId или eventId)'
            )
        }

        // 1. Сохраняем в БД
        const message = await this.prisma.message.create({
            data: {
                text: dto.text,
                senderId: userId,
                adId: dto.adId,
                eventId: dto.eventId
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatarUrl: true }
                }
            }
        })

        // 2. Рассылаем через WebSocket всем, кто в комнате этого чата
        const roomId = dto.adId ? `ad_${dto.adId}` : `event_${dto.eventId}`
        this.notificationsGateway.server.to(roomId).emit('new_message', message)

        return message
    }

    async getHistory(filter: { adId?: string; eventId?: string }) {
        return await this.prisma.message.findMany({
            where: {
                OR: [{ adId: filter.adId }, { eventId: filter.eventId }]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, name: true, avatarUrl: true }
                }
            }
        })
    }
}

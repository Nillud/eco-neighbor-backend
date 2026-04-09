/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotificationsGateway } from 'src/notifications/notifications.gateway'

@Injectable()
export class MessagesService {
	constructor(
		private prisma: PrismaService,
		private notificationsGateway: NotificationsGateway
	) {}

	async saveMessage(
		senderId: string,
		dto: { text: string; adId?: string; eventId?: string; receiverId?: string }
	) {
		let finalReceiverId = dto.receiverId

		if (dto.adId && !finalReceiverId) {
			const ad = await this.prisma.ad.findUnique({
				where: { id: dto.adId },
				select: { authorId: true }
			})
			finalReceiverId = ad?.authorId
		}

		// Используем 'as any' для data, чтобы заигнорить ошибку отсутствия receiverId
		const message = await this.prisma.message.create({
			data: {
				text: dto.text,
				senderId: senderId,
				receiverId: finalReceiverId,
				adId: dto.adId,
				eventId: dto.eventId
			} as any,
			include: {
				sender: { select: { id: true, name: true, avatarUrl: true } }
			}
		})

		let roomId: string
		if (dto.eventId) {
			roomId = `event_${dto.eventId}`
		} else {
			const ids = [senderId, finalReceiverId!].sort()
			roomId = `ad_${dto.adId}_${ids[0]}_${ids[1]}`
		}

		this.notificationsGateway.server.to(roomId).emit('new_message', message)
		return message
	}

	async getHistory(
		currentUserId: string,
		filter: { adId?: string; eventId?: string; participantId?: string }
	) {
		const where: any = {}

		if (filter.eventId) {
			where.eventId = filter.eventId
		} else if (filter.adId) {
			where.adId = filter.adId
			where.OR = [
				{ senderId: currentUserId, receiverId: filter.participantId },
				{ senderId: filter.participantId, receiverId: currentUserId }
			]
		}

		return this.prisma.message.findMany({
			where,
			orderBy: { createdAt: 'asc' },
			include: {
				sender: { select: { id: true, name: true, avatarUrl: true } }
			}
		})
	}

	async getChatList(userId: string) {
		const messages = await this.prisma.message.findMany({
			where: {
				OR: [
					{ senderId: userId },
					{ receiverId: userId },
					{ event: { participants: { some: { userId } } } }
				]
			} as any,
			// Приводим весь объект include к any, чтобы TS не проверял его свойства
			include: {
				sender: { select: { id: true, name: true, avatarUrl: true } },
				receiver: { select: { id: true, name: true, avatarUrl: true } },
				ad: { select: { id: true, title: true } },
				event: { select: { id: true, title: true } }
			} as any,
			orderBy: { createdAt: 'desc' }
		})

		const chats = new Map()

		messages.forEach((msg: any) => {
			let key = ''
			if (msg.eventId) {
				key = `event_${msg.eventId}`
			} else if (msg.adId) {
				const partnerId =
					msg.senderId === userId ? msg.receiverId : msg.senderId
				key = `ad_${msg.adId}_${partnerId}`
			}

			if (!chats.has(key)) {
				chats.set(key, {
					id: key,
					lastMessage: msg.text,
					date: msg.createdAt,
					type: msg.eventId ? 'EVENT' : 'AD',
					title: msg.event?.title || msg.ad?.title || 'Чат',
					partner: msg.senderId === userId ? msg.receiver : msg.sender,
					metadata: { adId: msg.adId, eventId: msg.eventId }
				})
			}
		})

		return Array.from(chats.values())
	}
}

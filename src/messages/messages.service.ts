/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotificationsGateway } from 'src/notifications/notifications.gateway'
import { Prisma } from 'prisma/generated/client'

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
					{
						event: {
							OR: [
								{ participants: { some: { userId } } },
								{ creatorId: userId }
							]
						}
					}
				]
			},
			include: {
				sender: { select: { id: true, name: true, avatarUrl: true } },
				receiver: { select: { id: true, name: true, avatarUrl: true } },
				ad: { select: { id: true, title: true, slug: true } },
				event: { select: { id: true, title: true, slug: true, imageUrl: true } }
			},
			orderBy: { createdAt: 'desc' }
		})

		type MessageWithRelations = Prisma.MessageGetPayload<{
			include: {
				sender: { select: { id: true; name: true; avatarUrl: true } }
				receiver: { select: { id: true; name: true; avatarUrl: true } }
				ad: { select: { id: true; title: true; slug: true } }
				event: { select: { id: true; title: true; slug: true; imageUrl: true } }
			}
		}>

		const userEvents = await this.prisma.event.findMany({
			where: {
				OR: [{ participants: { some: { userId } } }, { creatorId: userId }]
			},
			select: { id: true, title: true, slug: true, imageUrl: true }
		})

		const chats = new Map()

		userEvents.forEach(event => {
			const key = `event_${event.id}`
			chats.set(key, {
				id: key,
				lastMessage: 'Сообщений пока нет',
				date: new Date(),
				type: 'EVENT',
				title: event.title,
				partner: {
					name: event.title,
					avatarUrl: event.imageUrl || null
				},
				metadata: {
					eventId: event.id,
					eventSlug: event.slug,
					eventImage: event.imageUrl,
					adId: null,
					adSlug: null
				}
			})
		})

		messages.forEach((msg: MessageWithRelations) => {
			let key = ''
			if (msg.eventId) {
				key = `event_${msg.eventId}`
			} else if (msg.adId) {
				const partnerId =
					msg.senderId === userId ? msg.receiverId : msg.senderId
				key = `ad_${msg.adId}_${partnerId}`
			}

			if (msg.eventId) {
				const existingEventChat = chats.get(key)
				if (existingEventChat) {
					if (
						existingEventChat.lastMessage === 'Сообщений пока нет' ||
						new Date(msg.createdAt) > new Date(existingEventChat.date)
					) {
						existingEventChat.lastMessage = msg.text
						existingEventChat.date = msg.createdAt
					}
				} else {
					chats.set(key, {
						id: key,
						lastMessage: msg.text,
						date: msg.createdAt,
						type: 'EVENT',
						title: msg.event?.title || 'Чат мероприятия',
						partner: { name: msg.event?.title, avatarUrl: msg.event?.imageUrl },
						metadata: {
							adId: null,
							eventId: msg.eventId,
							adSlug: null,
							eventSlug: msg.event?.slug,
							eventImage: msg.event?.imageUrl
						}
					})
				}
			} else if (msg.adId) {
				if (!chats.has(key)) {
					chats.set(key, {
						id: key,
						lastMessage: msg.text,
						date: msg.createdAt,
						type: 'AD',
						title: msg.ad?.title || 'Чат',
						partner: msg.senderId === userId ? msg.receiver : msg.sender,
						metadata: {
							adId: msg.adId,
							eventId: null,
							adSlug: msg.ad?.slug,
							eventSlug: null,
							eventImage: null
						}
					})
				}
			}
		})

		return Array.from(chats.values()).sort((a, b) => b.date - a.date)
	}

	async getOrCreateEventChat(userId: string, eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			select: { creatorId: true, title: true, id: true }
		})

		if (!event) throw new NotFoundException('Мероприятие не найдено')

		const isParticipant = await this.prisma.eventParticipant.findFirst({
			where: { eventId, userId }
		})

		if (!isParticipant && event.creatorId !== userId) {
			throw new ForbiddenException(
				'Вы не являетесь участником или организатором этого события'
			)
		}

		const history = await this.getHistory(userId, { eventId })

		return {
			event,
			messages: history
		}
	}
}

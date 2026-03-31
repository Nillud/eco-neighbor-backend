/* eslint-disable @typescript-eslint/no-unused-vars */
// src/notifications/notifications.gateway.ts
import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	cors: {
		origin: '*' // В продакшене замени на конкретный URL фронтенда
	},
	namespace: 'notifications'
})
export class NotificationsGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server

	// Хранилище активных подключений: Map<userId, socketId>
	private activeConnections = new Map<string, string>()

	/**
	 * Обработка подключения
	 */
	async handleConnection(client: Socket) {
		const userId = client.handshake.query.userId as string

		if (userId) {
			this.activeConnections.set(userId, client.id)
			// Присоединяем сокет к комнате пользователя для точечной рассылки
			await client.join(`user_${userId}`)
			console.log(`[Socket] User connected: ${userId}, socket: ${client.id}`)
		}
	}

	/**
	 * Обработка отключения
	 */
	handleDisconnect(client: Socket) {
		const userId = [...this.activeConnections.entries()].find(
			([_, id]) => id === client.id
		)?.[0]

		if (userId) {
			this.activeConnections.delete(userId)
			console.log(`[Socket] User disconnected: ${userId}`)
		}
	}

	/**
	 * Отправка обновления по ачивкам конкретному пользователю
	 */
	sendAchievementUpdate(userId: string, data: unknown) {
		this.server.to(`user_${userId}`).emit('achievement_update', data)
	}

	/**
	 * Пример подписки: вход в комнату обсуждения (чата) объявления
	 */
	@SubscribeMessage('join_room')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomId: string
	) {
		await client.join(roomId)
		console.log(`[Socket] Client ${client.id} joined room ${roomId}`)
		return { event: 'joined', room: roomId }
	}

	/**
	 * Отправка системного уведомления (всем)
	 */
	sendBroadcastNotification(message: string) {
		this.server.emit('broadcast', { message, date: new Date() })
	}

	@SubscribeMessage('join_chat')
	async handleJoinChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { adId?: string; eventId?: string }
	) {
		const roomId = data.adId ? `ad_${data.adId}` : `event_${data.eventId}`
		await client.join(roomId)
		console.log(`[Socket] Client ${client.id} joined chat room: ${roomId}`)
		return { status: 'joined', room: roomId }
	}

	@SubscribeMessage('leave_chat')
	async handleLeaveChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { adId?: string; eventId?: string }
	) {
		const roomId = data.adId ? `ad_${data.adId}` : `event_${data.eventId}`
		await client.leave(roomId)
		console.log(`[Socket] Client ${client.id} left chat room: ${roomId}`)
	}
}

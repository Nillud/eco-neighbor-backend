/* eslint-disable @typescript-eslint/no-explicit-any */
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
		origin: 'http://localhost:3000', // Укажи точный адрес фронта
		credentials: true
	},
	namespace: 'notifications'
})
export class NotificationsGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server

	private activeConnections = new Map<string, string>()

	async handleConnection(client: Socket) {
		const userId = client.handshake.query.userId as string
		// Браузер передаст куки в handshake.headers.cookie, если включен withCredentials
		const cookies = client.handshake.headers.cookie

		if (userId) {
			this.activeConnections.set(userId, client.id)
			await client.join(`user_${userId}`)
			console.log(`[Socket] User connected: ${userId}, socket: ${client.id}`)
		}
	}

	handleDisconnect(client: Socket) {
		const userId = [...this.activeConnections.entries()].find(
			([_, id]) => id === client.id
		)?.[0]

		if (userId) {
			this.activeConnections.delete(userId)
			console.log(`[Socket] User disconnected: ${userId}`)
		}
	}

	sendAchievementUpdate(userId: string, data: any) {
		this.server.to(`user_${userId}`).emit('achievement_update', data)
	}

	@SubscribeMessage('join_room')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string }
	) {
		await client.join(data.roomId)
		console.log(`[Socket] Client joined room: ${data.roomId}`)
		return { status: 'joined', room: data.roomId }
	}

	@SubscribeMessage('leave_room')
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string }
	) {
		await client.leave(data.roomId)
		console.log(`[Socket] Client left room: ${data.roomId}`)
	}
}

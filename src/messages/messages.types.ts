export interface ChatMessageFromDb {
	id: string
	text: string
	createdAt: Date
	eventId: string | null
	adId: string | null
	senderId: string
	receiverId: string | null
	event?: { title: string; slug: string; imageUrl: string | null }
	ad?: { id: string; title: string; slug: string }
	sender: { id: string; name: string; avatarUrl: string | null }
	receiver: { id: string; name: string; avatarUrl: string | null }
}

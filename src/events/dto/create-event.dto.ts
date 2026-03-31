export class CreateEventDto {
	title: string
	description: string
	phone?: string
	date: string | Date
	location: string
	latitude: number
	longitude: number
	maxParticipants?: number
}

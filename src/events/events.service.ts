import {
	Injectable,
	NotFoundException,
	BadRequestException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AchievementsService } from 'src/achievements/achievements.service'
import { CreateEventDto } from './dto/create-event.dto'
import { REWARDS } from './utils/rewards.util'
import { EventFilterDto } from './dto/event-filter.dto'
import { slugify } from 'transliteration'

@Injectable()
export class EventsService {
	constructor(
		private prisma: PrismaService,
		private achievementsService: AchievementsService
	) {}

	async create(userId: string, dto: CreateEventDto) {
		const eventDate = new Date(dto.date)

		if (eventDate < new Date()) {
			throw new BadRequestException('Нельзя создать мероприятие в прошлом')
		}

		const baseSlug = slugify(dto.title)
		const uniqueId = Math.random().toString(36).substring(2, 7)
		const slug = `${baseSlug}-${uniqueId}`

		return this.prisma.event.create({
			data: {
				...dto,
				slug,
				date: eventDate,
				creatorId: userId
			}
		})
	}

	async findAll(filters: EventFilterDto) {
		console.log(filters)
		return this.prisma.event.findMany({
			where: {
				// Если фильтр передан — фильтруем, если нет — игнорируем
				category: filters.category,
				status: filters.status
			},
			include: {
				_count: { select: { participants: true } },
				creator: { select: { name: true } }
			},
			orderBy: { date: 'desc' }
		})
	}

	async getBySlug(slug: string) {
		const event = await this.prisma.event.findUnique({
			where: { slug },
			include: {
				creator: { select: { name: true, avatarUrl: true } },
				participants: {
					include: {
						user: { select: { id: true, name: true, avatarUrl: true } }
					}
				},
				_count: { select: { participants: true } }
			}
		})

		if (!event) throw new NotFoundException('Событие не найдено')
		return event
	}

	async update(userId: string, eventId: string, dto: Partial<CreateEventDto>) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId }
		})

		if (!event) throw new NotFoundException('Событие не найдено')

		// Проверка на владельца
		if (event.creatorId !== userId) {
			throw new BadRequestException('Вы не можете редактировать чужое событие')
		}

		// Если событие уже завершено, редактировать его нельзя (опционально)
		if (event.status === 'FINISHED') {
			throw new BadRequestException(
				'Нельзя редактировать завершенное мероприятие'
			)
		}

		// Если меняется заголовок, можно обновить slug (опционально),
		// но обычно slug оставляют старым, чтобы не ломать ссылки.

		return this.prisma.event.update({
			where: { id: eventId },
			data: {
				...dto,
				// Если дата пришла строкой, конвертируем в Date объект
				date: dto.date ? new Date(dto.date) : event.date
			}
		})
	}

	/**
	 * РЕГИСТРАЦИЯ НА СОБЫТИЕ
	 */
	async toggleRegistration(userId: string, eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: { _count: { select: { participants: true } } }
		})

		if (!event) throw new NotFoundException('Событие не найдено')

		// Проверяем, есть ли уже запись
		const existingRegistration = await this.prisma.eventParticipant.findUnique({
			where: { userId_eventId: { userId, eventId } }
		})

		if (existingRegistration) {
			// Если запись есть — удаляем (отписываемся)
			await this.prisma.eventParticipant.delete({
				where: { id: existingRegistration.id }
			})
			return { isJoined: false }
		}

		// Если записи нет — проверяем условия для регистрации
		if (event.status !== 'UPCOMING') {
			throw new BadRequestException('Запись на это событие закрыта')
		}

		if (new Date(event.date) < new Date()) {
			throw new BadRequestException('Событие уже началось или прошло')
		}

		if (
			event.maxParticipants &&
			event._count.participants >= event.maxParticipants
		) {
			throw new BadRequestException('Мест больше нет')
		}

		await this.prisma.eventParticipant.create({
			data: { userId, eventId }
		})

		return { isJoined: true }
	}

	async finishEvent(userId: string, eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: { participants: true } // Получаем список всех записавшихся
		})

		if (!event) throw new NotFoundException('Событие не найдено')
		if (event.creatorId !== userId)
			throw new BadRequestException('Вы не организатор')
		if (event.status === 'FINISHED')
			throw new BadRequestException('Событие завершено')

		const reward = REWARDS[event.category] || REWARDS.OTHER

		return await this.prisma.$transaction(async tx => {
			await tx.event.update({
				where: { id: eventId },
				data: { status: 'FINISHED' }
			})

			for (const participant of event.participants) {
				await tx.user.update({
					where: { id: participant.userId },
					data: { rating: { increment: reward.points } }
				})

				if (reward.slug) {
					await this.achievementsService.updateProgress(
						participant.userId,
						reward.slug,
						1
					)
				}
			}

			return { success: true, rewardedParticipants: event.participants.length }
		})
	}

	async delete(userId: string, eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId }
		})

		if (!event) throw new NotFoundException('Событие не найдено')
		if (event.creatorId !== userId)
			throw new BadRequestException('Вы не можете удалить чужое событие')

		return this.prisma.$transaction([
			this.prisma.eventParticipant.deleteMany({ where: { eventId } }),
			this.prisma.event.delete({ where: { id: eventId } })
		])
	}
}

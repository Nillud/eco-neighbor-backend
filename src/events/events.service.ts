/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	Injectable,
	NotFoundException,
	BadRequestException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AchievementsService } from 'src/achievements/achievements.service'
import { CreateEventDto } from './dto/create-event.dto'
import { REWARDS } from './utils/rewards.util'

@Injectable()
export class EventsService {
	constructor(
		private prisma: PrismaService,
		private achievementsService: AchievementsService
	) {}

	async create(userId: string, dto: CreateEventDto) {
		return this.prisma.event.create({
			data: {
				...dto,
				date: new Date(dto.date),
				creatorId: userId
			}
		})
	}

	async findAll() {
		return this.prisma.event.findMany({
			include: {
				_count: { select: { participants: true } },
				creator: { select: { name: true } }
			},
			orderBy: { date: 'asc' }
		})
	}

	/**
	 * РЕГИСТРАЦИЯ НА СОБЫТИЕ
	 */
	async register(userId: string, eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: { _count: { select: { participants: true } } }
		})

		if (!event) throw new NotFoundException('Событие не найдено')

		await this.prisma.user.update({
			where: { id: userId },
			data: { rating: { increment: 25 } } // Используем Floor, если передали Float
		})

		// 1. Проверка, не записан ли уже юзер (через @@unique в схеме упадет ошибка, но лучше проверить)
		const alreadyRegistered = await this.prisma.eventParticipant.findUnique({
			where: { userId_eventId: { userId, eventId } }
		})
		if (alreadyRegistered) throw new BadRequestException('Вы уже записаны')

		// 2. Проверка на лимит мест
		if (
			event.maxParticipants &&
			event._count.participants >= event.maxParticipants
		) {
			throw new BadRequestException('Мест больше нет')
		}

		const registration = await this.prisma.eventParticipant.create({
			data: { userId, eventId }
		})

		// --- ГЕЙМИФИКАЦИЯ ---
		// За регистрацию (участие в субботнике/встрече) начисляем прогресс
		await this.achievementsService.updateProgress(userId, 'AD_CLEANUP', 1)

		return registration
	}

	async unregister(userId: string, eventId: string) {
		const finded = await this.prisma.eventParticipant.findUnique({
			where: { userId_eventId: { userId, eventId } }
		})

		if (!finded) throw new BadRequestException('Вы и так не записаны')

		return this.prisma.eventParticipant.delete({
			where: { userId_eventId: { userId, eventId } }
		})
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

		return this.prisma.event.delete({
			where: { id: eventId }
		})
	}
}

import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateMapPointDto } from './dto/create-map-point.dto'

@Injectable()
export class MapService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateMapPointDto, authorId: string) {
		const { wasteIds, ...pointData } = dto

		return this.prisma.mapPoint.create({
			data: {
				...pointData,
				authorId,
				isVerified: false, // Новые точки всегда не подтверждены
				wasteMapPoints: {
					create: wasteIds.map(id => ({
						waste: { connect: { id } }
					}))
				}
			}
		})
	}

	async getById(id: string) {
		return this.prisma.mapPoint.findUnique({
			where: { id },
			include: {
				wasteMapPoints: { include: { waste: true } },
				author: { select: { name: true } }
			}
		})
	}

	async update(id: string, dto: CreateMapPointDto) {
		const { wasteIds, ...pointData } = dto

		return this.prisma.mapPoint.update({
			where: { id },
			data: {
				...pointData,
				// Обновляем связи Many-to-Many
				wasteMapPoints: {
					deleteMany: {}, // Удаляем все старые категории для этой точки
					create: wasteIds.map(wasteId => ({
						waste: { connect: { id: wasteId } }
					}))
				}
			},
			include: {
				wasteMapPoints: { include: { waste: true } }
			}
		})
	}

	async getPendingPoints() {
		return this.prisma.mapPoint.findMany({
			where: { isVerified: false },
			include: {
				wasteMapPoints: { include: { waste: true } },
				author: { select: { name: true, email: true } }
			}
		})
	}

	async verifyPoint(id: string) {
		const point = await this.prisma.mapPoint.update({
			where: { id },
			data: { isVerified: true },
			select: { authorId: true }
		})

		// Начисляем рейтинг автору ТОЛЬКО после модерации
		if (point.authorId) {
			await this.prisma.user.update({
				where: { id: point.authorId },
				data: { rating: { increment: 40 } }
			})
		}
		return point
	}

	async getAll(wasteSlugs?: string[]) {
		return this.prisma.mapPoint.findMany({
			where: {
				isVerified: true,
				...(wasteSlugs?.length
					? {
							wasteMapPoints: {
								some: {
									waste: {
										slug: {
											in: wasteSlugs
										}
									}
								}
							}
						}
					: {})
			},
			include: {
				wasteMapPoints: {
					select: {
						waste: {
							select: {
								name: true,
								slug: true
							}
						}
					}
				},
				author: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				id: 'desc'
			}
		})
	}

	async delete(id: string) {
		await this.prisma.wasteMapPoint.deleteMany({ where: { mapPointId: id } })
		return this.prisma.mapPoint.delete({ where: { id } })
	}
}

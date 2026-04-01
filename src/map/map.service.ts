import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateMapPointDto } from './dto/create-map-point.dto'

@Injectable()
export class MapService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateMapPointDto & { authorId: string | null }) {
		const { wasteIds, ...pointData } = dto

		if (dto.authorId)
			await this.prisma.user.update({
				where: { id: dto.authorId },
				data: { rating: { increment: 40 } } // Используем Floor, если передали Float
			})

		return this.prisma.mapPoint.create({
			data: {
				...pointData,
				authorId: dto.authorId ?? null,
				wasteMapPoints: {
					create: wasteIds.map(id => ({
						waste: { connect: { id } }
					}))
				}
			},
			include: { wasteMapPoints: { include: { waste: true } } }
		})
	}

	async getAll(wasteSlugs?: string[]) {
		return this.prisma.mapPoint.findMany({
			where: wasteSlugs?.length
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
				: {},
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

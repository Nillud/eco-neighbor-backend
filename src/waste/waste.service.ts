import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class WasteService {
	constructor(private prisma: PrismaService) {}

	async create(name: string) {
		const slug = name.toLowerCase().replace(/ /g, '-')
		return this.prisma.waste.create({ data: { name, slug } })
	}

	async findAll() {
		return this.prisma.waste.findMany()
	}

	async delete(id: string) {
		return this.prisma.waste.delete({ where: { id } })
	}
}

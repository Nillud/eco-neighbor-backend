import { Unit } from "prisma/generated/enums"

export class CreateAchievementDto {
	slug: string
	title: string
	description: string
	iconUrl: string

	category: string
	unit: Unit
	requirementCount: number
	points: number
}

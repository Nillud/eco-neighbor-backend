import { EventCategory } from 'prisma/generated/enums'

export const REWARDS: Record<
	EventCategory,
	{ points: number; slug: string | null }
> = {
	[EventCategory.CLEANUP]: { points: 50, slug: 'cleanup' },
	[EventCategory.WORKSHOP]: { points: 30, slug: 'eco-student' },
	[EventCategory.EXCHANGE]: { points: 20, slug: 'community' },
	[EventCategory.OTHER]: { points: 15, slug: null }
}

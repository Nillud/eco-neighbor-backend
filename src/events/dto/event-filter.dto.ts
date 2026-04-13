// dto/event-filter.dto.ts
import { EventCategory, EventStatus } from 'prisma/generated/enums'

export class EventFilterDto {
    category?: EventCategory
    status?: EventStatus
}
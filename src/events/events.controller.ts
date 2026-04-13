import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Query,
	Put
} from '@nestjs/common'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { EventFilterDto } from './dto/event-filter.dto'

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Post()
	@Auth()
	create(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
		return this.eventsService.create(userId, dto)
	}

	@Get()
	findAll(@Query() filters: EventFilterDto) {
		return this.eventsService.findAll(filters)
	}

	@Get('by-slug/:slug')
	getBySlug(@Param('slug') slug: string) {
		return this.eventsService.getBySlug(slug)
	}

	@Put(':id')
	@Auth()
	update(
		@CurrentUser('id') userId: string,
		@Param('id') id: string,
		@Body() dto: Partial<CreateEventDto>
	) {
		return this.eventsService.update(userId, id, dto)
	}

	@Post(':id/toggle-registration')
	@Auth()
	toggleRegistration(
		@CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		return this.eventsService.toggleRegistration(userId, id)
	}

	@Post(':id/finish')
	@Auth()
	finish(@CurrentUser('id') userId: string, @Param('id') id: string) {
		return this.eventsService.finishEvent(userId, id)
	}

	@Delete(':id')
	@Auth()
	delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
		return this.eventsService.delete(userId, id)
	}
}

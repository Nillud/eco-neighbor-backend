import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    @Auth() // Создавать могут все (или Role.ADMIN / Role.USER в зависимости от правил)
    create(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
        return this.eventsService.create(userId, dto)
    }

    @Get()
    findAll() {
        return this.eventsService.findAll()
    }

    @Post(':id/register')
    @Auth()
    register(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.eventsService.register(userId, id)
    }

    @Delete(':id/unregister')
    @Auth()
    unregister(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.eventsService.unregister(userId, id)
    }
}
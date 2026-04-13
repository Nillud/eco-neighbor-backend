import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator'
import { EventCategory } from 'prisma/generated/enums'

export class CreateEventDto {
	@IsString() @IsNotEmpty() title!: string
	@IsString() @IsNotEmpty() description!: string
	@IsEnum(EventCategory) category!: EventCategory
	@IsOptional() @IsString() phone?: string
	@IsOptional() @IsString() imageUrl?: string
	@IsNotEmpty() date!: string | Date
	@IsString() location!: string
	@IsNumber() latitude!: number
	@IsNumber() longitude!: number
	@IsOptional() @IsNumber() maxParticipants?: number
}

import { ApiProperty } from '@nestjs/swagger'
import { AdType } from 'prisma/generated/enums'

export class CreateAdDto {
	@ApiProperty({
		example: 'Отдам старый кактус',
		description: 'Заголовок объявления'
	})
	title: string

	@ApiProperty({
		example: 'Здоровый, колючий, самовывоз',
		description: 'Описание'
	})
	description: string

	@ApiProperty({
		example: '+79999999999',
		description: 'Телефон'
	})
	phone?: string

	@ApiProperty({ enum: AdType, example: 'GIVEAWAY' })
	type: AdType

	imageUrl?: string
}

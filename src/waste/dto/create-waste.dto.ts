import { ApiProperty } from "@nestjs/swagger";

export class CreateWasteDto {
    @ApiProperty({ example: 'Пластиковая бутылка', description: 'Заголовок' })
	name: string
}

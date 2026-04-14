import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
    @IsString()
    oldPassword!: string

    @IsString()
    @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
    newPassword!: string
}
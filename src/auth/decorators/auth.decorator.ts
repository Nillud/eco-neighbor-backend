import { applyDecorators, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../guards/admin.guard'
import { Role } from 'prisma/generated/enums'
import { JwtAuthGuard } from '../guards/jwt.guard'

export const Auth = (role: Role = Role.USER) => {
    if (role === Role.ADMIN) {
        return applyDecorators(UseGuards(JwtAuthGuard, AdminGuard))
    }
    return applyDecorators(UseGuards(JwtAuthGuard))
}
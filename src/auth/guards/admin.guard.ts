/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException
} from '@nestjs/common'
import { Role } from 'prisma/generated/enums'
@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest()
		const user = request.user

		if (user?.role !== Role.ADMIN) {
			throw new ForbiddenException(
				'У вас недостаточно прав для выполнения этого действия'
			)
		}

		return true
	}
}

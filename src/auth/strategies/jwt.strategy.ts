import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { User } from 'prisma/generated/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private prisma: PrismaService
	) {
		const jwtSecret = process.env.JWT_SECRET
		if (!jwtSecret) {
			throw new Error('JWT_SECRET is not defined')
		}

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) =>
					(request?.cookies?.accessToken as string | null) ?? null,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
			// ignoreExpiration: true
		})
	}

	async validate({ id }: { id: string }): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})
		if (!user) throw new UnauthorizedException('User not found')

		return user
	}
}

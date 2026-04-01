import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { isDev } from 'src/utils/is-dev.util'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { generateToken } from 'src/utils/generate-token.util'
import { UsersService } from 'src/users/users.service'
import { EmailService } from 'src/email/email.service'
import { hash, verify } from 'argon2'
import { TAuthTokenData } from './types/auth.interface'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private configService: ConfigService,
		private jwt: JwtService,
		private usersService: UsersService,
		private emailService: EmailService
	) {}

	private readonly EXPIRE_HOURS_ACCESS_TOKEN = 1
	readonly ACCESS_TOKEN_NAME = 'accessToken' as const

	private readonly EXPIRE_DAYS_REFRESH_TOKEN = 3
	readonly REFRESH_TOKEN_NAME = 'refreshToken' as const

	async register(dto: RegisterDto) {
		try {
			const email = dto.email.toLowerCase()
			const existingUser = await this.usersService.findByEmail(email)

			if (existingUser) {
				throw new BadRequestException('User with this email already exists')
			}

			const emailVerificationToken = generateToken()

			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					name: dto.name,
					password: await hash(dto.password),
					emailVerificationToken,
					emailVerificationTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
				}
			})

			const tokens = this._generateTokens({ id: user.id, role: user.role })

			const verificationUrl = `${this.configService.get('CLIENT_URL')}/verify-email?token=${emailVerificationToken}`

			// await this.emailService.sendVerificationEmail(user.email, verificationUrl)
			await this.emailService.sendVerificationEmail(
				'agadullin.linar@mail.ru',
				verificationUrl
			)

			return { user, ...tokens }
		} catch (error) {
			throw new BadRequestException(`Registration failed: ` + error)
		}
	}

	async login(dto: LoginDto) {
		const user = await this._validateUser(dto)

		const tokens = this._generateTokens({
			id: user.id,
			role: user.role
		})

		return { user, ...tokens }
	}

	async getNewTokens(refreshToken: string) {
		const result =
			await this.jwt.verifyAsync<Pick<TAuthTokenData, 'id'>>(refreshToken)
		if (!result) throw new BadRequestException('Invalid refresh token')

		const user = await this.usersService.findById(result.id)

		if (!user) throw new NotFoundException('User not found')

		const tokens = this._generateTokens({
			id: user.id,
			role: user.role
		})

		return {
			user,
			...tokens
		}
	}

	async validateOAuthUser(details: {
		email: string
		name: string
		avatarUrl?: string
	}) {
		let user = await this.usersService.findByEmail(details.email)

		if (!user) {
			const randomPassword = await hash(generateToken())

			user = await this.prisma.user.create({
				data: {
					email: details.email,
					name: details.name,
					avatarUrl: details.avatarUrl,
					password: randomPassword,
					isEmailVerified: true
				}
			})
		}

		return this._generateTokens({ id: user.id, role: user.role })
	}

	private async _validateUser(input: LoginDto) {
		const email = input.email

		const user = await this.usersService.findByEmail(email)
		if (!user) throw new NotFoundException()

		const isPasswordValid = await verify(user.password, input.password)
		if (!isPasswordValid)
			throw new NotFoundException(`Invalid email or password`)

		return user
	}

	private _generateTokens(data: TAuthTokenData) {
		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(
			{
				id: data.id
			},
			{
				expiresIn: `${this.EXPIRE_DAYS_REFRESH_TOKEN}d`
			}
		)

		return { accessToken, refreshToken }
	}

	toggleAccessTokenCookie(res: Response, token: string | null) {
		this.toggleAuthTokenCookie({
			response: res,
			name: this.ACCESS_TOKEN_NAME,
			token,
			expires: new Date(
				Date.now() + this.EXPIRE_HOURS_ACCESS_TOKEN * 60 * 60 * 1000
			)
		})
	}

	toggleRefreshTokenCookie(res: Response, token: string | null) {
		this.toggleAuthTokenCookie({
			response: res,
			name: this.REFRESH_TOKEN_NAME,
			token,
			expires: new Date(
				Date.now() + this.EXPIRE_DAYS_REFRESH_TOKEN * 24 * 60 * 60 * 1000
			)
		})
	}

	private toggleAuthTokenCookie({
		response,
		name,
		token,
		expires
	}: {
		response: Response
		name: AuthService['ACCESS_TOKEN_NAME'] | AuthService['REFRESH_TOKEN_NAME']
		token: string | null
		expires: Date
	}) {
		const isRemoveCookie = !token
		const expiresIn = isRemoveCookie ? new Date(0) : expires

		response.cookie(name, token || '', {
			httpOnly: true,
			domain: 'localhost',
			expires: expiresIn,
			// sameSite: 'lax',
			// secure: false
			sameSite: isDev(this.configService) ? 'none' : 'strict',
			secure: true
		})
	}
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Query,
	Req,
	Res,
	UnauthorizedException,
	UseGuards
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthAccountService } from './auth-account.service'
import { RegisterDto } from './dto/register.dto'
import type { Request, Response } from 'express'
import { LoginDto } from './dto/login.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private authAccountService: AuthAccountService
	) {}

	@Post('register')
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.register(dto)

		this.authService.toggleAccessTokenCookie(res, accessToken)
		this.authService.toggleRefreshTokenCookie(res, refreshToken)

		return user
	}

	@Post('login')
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.login(dto)

		this.authService.toggleAccessTokenCookie(res, accessToken)
		this.authService.toggleRefreshTokenCookie(res, refreshToken)

		return user
	}

	@Get('yandex')
	@UseGuards(AuthGuard('yandex'))
	async yandexAuth() {}

	@Get('yandex/callback')
	@UseGuards(AuthGuard('yandex'))
	async yandexAuthCallback(
		@Req() req,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken } =
			await this.authService.validateOAuthUser(req.user)

		this.authService.toggleAccessTokenCookie(res, accessToken)
		this.authService.toggleRefreshTokenCookie(res, refreshToken)

		return res.redirect('http://localhost:3000/profile')
	}

	@Post('new-tokens')
	async newTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshToken = req.cookies[this.authService.REFRESH_TOKEN_NAME]
		if (!refreshToken) throw new BadRequestException('Refresh token missing')

		const tokens = await this.authService.getNewTokens(refreshToken)

		this.authService.toggleAccessTokenCookie(res, tokens.accessToken)
		this.authService.toggleRefreshTokenCookie(res, tokens.refreshToken)

		return tokens.user
	}

	@Get('verify-email')
	async verifyEmail(@Query('token') token: string) {
		if (!token) {
			throw new UnauthorizedException('Token not passed')
		}
		return this.authAccountService.verifyEmail(token)
	}

	@Post('password-reset/request')
	async requestReset(@Body('email') email: string) {
		return this.authAccountService.requestPasswordReset(email)
	}

	@Post('password-reset/confirm')
	async confirmReset(@Body() dto: ResetPasswordDto) {
		return this.authAccountService.resetPassword(dto.token, dto.newPassword)
	}

	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		this.authService.toggleAccessTokenCookie(res, null)
		this.authService.toggleRefreshTokenCookie(res, null)
		return true
	}
}

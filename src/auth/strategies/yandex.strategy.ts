/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile } from 'passport-yandex'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
	constructor(private configService: ConfigService) {
		super({
			clientID: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
			clientSecret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
			callbackURL: 'http://localhost:4200/api/auth/yandex/callback' // URL из настроек вашего приложения в Яндекс ID
		})
	}

	validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: (err: any, user: any, info?: any) => void
	) {
		const { id, displayName, emails, photos } = profile

		const user = {
			email: emails?.[0]?.value,
			name: displayName,
			avatarUrl: photos?.[0]?.value,
			yandexId: id
		}

		done(null, user)
	}
}

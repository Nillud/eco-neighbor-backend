/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common'
import { render } from '@react-email/render'
import { ResendService } from 'nestjs-resend'
import VerificationEmail from './templates/verification-email'
import ResetPassword from './templates/reset-password'

@Injectable()
export class EmailService {
	constructor(private readonly resend: ResendService) {}

	private async send(to: string, subject: string, html: string) {
		return this.resend.send({
			from: `onboarding@resend.dev`,
			to,
			subject,
			html
		})
	}

	async sendVerificationEmail(to: string, url: string) {
		const html = await render(VerificationEmail({ url }))
		return this.send(to, 'Verify your email', html)
	}

	async sendResetPasswordEmail(to: string, url: string) {
		const html = await render(ResetPassword({ url }))
		return this.send(to, 'Reset your password', html)
	}
}

import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Link,
	Preview,
	Section,
	Text
} from '@react-email/components'
import type { CSSProperties } from 'react'

interface Props {
	url: string
	appName?: string
}

export default function VerificationEmail({
	url,
	appName = 'EcoNeighbor'
}: Props) {
	return (
		<Html>
			<Head />
			<Preview>Подтвердите вашу почту</Preview>
			<Body style={body}>
				<Container style={container}>
					<Section>
						<Text style={heading}>Подтверждение email</Text>

						<Text style={text}>
							Спасибо за регистрацию в {appName}. Чтобы завершить создание
							аккаунта, подтвердите вашу почту.
						</Text>

						<Section style={buttonContainer}>
							<Button href={url} style={button}>
								Подтвердить почту
							</Button>
						</Section>

						<Text style={textSmall}>
							Если кнопка не работает, скопируйте ссылку:
						</Text>

						<Link href={url} style={link}>
							{url}
						</Link>

						<Text style={footer}>
							Если вы не регистрировались - просто проигнорируйте это письмо.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

const body: CSSProperties = {
	backgroundColor: '#f6f0fc',
	fontFamily: 'Arial, sans-serif'
}

const container: CSSProperties = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '40px 24px',
	borderRadius: '8px',
	maxWidth: '480px'
}

const heading: CSSProperties = {
	fontSize: '20px',
	fontWeight: '600',
	marginBottom: '16px'
}

const text: CSSProperties = {
	fontSize: '14px',
	lineHeight: '22px',
	marginBottom: '16px'
}

const buttonContainer: CSSProperties = {
	textAlign: 'center' as const,
	margin: '24px 0'
}

const button: CSSProperties = {
	backgroundColor: '#111827',
	color: '#ffffff',
	padding: '12px 20px',
	borderRadius: '6px',
	textDecoration: 'none',
	fontSize: '14px'
}

const link: CSSProperties = {
	fontSize: '12px',
	color: '#2563eb',
	wordBreak: 'break-all' as const
}

const textSmall: CSSProperties = {
	fontSize: '12px',
	marginBottom: '8px'
}

const footer: CSSProperties = {
	fontSize: '12px',
	color: '#6b7280',
	marginTop: '24px'
}

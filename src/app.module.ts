import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from './users/users.module'
import { EmailModule } from './email/email.module'
import { ResendModule } from 'nestjs-resend'
import { MapModule } from './map/map.module';
import { WasteModule } from './waste/waste.module';
import { AchievementsModule } from './achievements/achievements.module';
import { MediaUploadModule } from './media-upload/media-upload.module';
import { AdsModule } from './ads/ads.module';
import { EventsModule } from './events/events.module';
import { NotificationsGateway } from './notifications/notifications.gateway'
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ResendModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configSerivce: ConfigService) => ({
				apiKey: configSerivce.getOrThrow<string>('RESEND_API_KEY')
			}),
			inject: [ConfigService]
		}),
		PrismaModule,
		AuthModule,
		UsersModule,
		EmailModule,
		MapModule,
		WasteModule,
		AchievementsModule,
		MediaUploadModule,
		AdsModule,
		EventsModule,
		MessagesModule,
		NotificationsModule
	],
	controllers: [AppController],
	providers: [AppService, NotificationsGateway]
})
export class AppModule {}

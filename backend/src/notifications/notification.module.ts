import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UnpaidInvoicesNotificationService } from './unpaid-invoices-notification.service';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { PaiementsModule } from '../paiements/paiements.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User]),
        ScheduleModule.forRoot(),
        PaiementsModule,
    ],
    providers: [NotificationService, UnpaidInvoicesNotificationService],
    controllers: [NotificationController],
    exports: [NotificationService, UnpaidInvoicesNotificationService],
})
export class NotificationModule { }

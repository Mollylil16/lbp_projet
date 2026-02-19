import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('unread')
    getUnread() {
        return this.notificationService.getUnread();
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(+id);
    }

    @Post('read-all')
    markAllAsRead() {
        return this.notificationService.markAllAsRead();
    }
}

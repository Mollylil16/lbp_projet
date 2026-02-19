import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('paiements')
@UseGuards(JwtAuthGuard)
export class PaiementsHistoryController {
    constructor(private readonly paiementsService: PaiementsService) { }

    @Get('history/daily')
    async getDailyPaymentHistory(
        @Query('date') date?: string,
        @Query('agenceId', new ParseIntPipe({ optional: true })) agenceId?: number,
    ) {
        const targetDate = date ? new Date(date) : new Date();
        return this.paiementsService.getDailyPaymentHistory(targetDate, agenceId);
    }

    @Get('history/unpaid')
    async getUnpaidInvoices(
        @Query('agenceId', new ParseIntPipe({ optional: true })) agenceId?: number,
        @Query('status') status?: 'all' | 'overdue' | 'pending',
    ) {
        return this.paiementsService.getUnpaidInvoices(agenceId, status);
    }

    @Get('reconciliation/agency')
    async getAgencyReconciliation(
        @Query('date') date?: string,
        @Query('agenceId', new ParseIntPipe({ optional: true })) agenceId?: number,
    ) {
        const targetDate = date ? new Date(date) : new Date();
        return this.paiementsService.getAgencyReconciliation(targetDate, agenceId);
    }
}

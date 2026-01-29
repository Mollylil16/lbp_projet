import { Controller, Get, Query, UseGuards, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RapportsService } from './rapports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('rapports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rapports')
export class RapportsController {
    constructor(private readonly rapportsService: RapportsService) { }

    @Get('colis')
    @ApiOperation({ summary: 'Générer un rapport de colis' })
    getColisReport(@Query() query: any) {
        return this.rapportsService.generateRapportColis(query);
    }

    @Get('export/excel')
    @ApiOperation({ summary: 'Exporter le rapport en Excel' })
    async exportExcel(@Query() query: any, @Response() res) {
        const buffer = await this.rapportsService.exportExcel(query);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=rapport-${query.start_date || 'export'}.xlsx`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('export/pdf')
    @ApiOperation({ summary: 'Exporter le rapport en PDF' })
    async exportPDF(@Query() query: any, @Response() res) {
        const buffer = await this.rapportsService.exportPDF(query);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=rapport-${query.start_date || 'export'}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}

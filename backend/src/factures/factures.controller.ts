import { Controller, Get, Param, Patch, UseGuards, Request, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FacturesService } from './factures.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('factures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('factures')
export class FacturesController {
    constructor(private readonly facturesService: FacturesService) { }

    @Get()
    @ApiOperation({ summary: 'Liste de toutes les factures' })
    findAll() {
        return this.facturesService.findAll();
    }

    @Get('colis/:ref')
    @ApiOperation({ summary: 'Récupérer la facture d\'un colis par sa référence' })
    findByColis(@Param('ref') ref: string) {
        return this.facturesService.findByColisRef(ref);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'une facture' })
    findOne(@Param('id') id: string) {
        return this.facturesService.findOne(+id);
    }

    @Patch(':id/validate')
    @ApiOperation({ summary: 'Valider une facture proforma en définitive' })
    @ApiResponse({ status: 200, description: 'Facture validée avec succès' })
    validate(@Param('id') id: string) {
        return this.facturesService.validateProforma(+id);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Annuler une facture' })
    cancel(@Param('id') id: string) {
        return this.facturesService.cancelFacture(+id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Générer le PDF d\'une facture' })
    async getPDF(@Param('id') id: string, @Request() req, @Response() res) {
        const buffer = await this.facturesService.generatePDF(+id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=facture-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}

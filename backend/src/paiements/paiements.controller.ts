import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('paiements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('paiements')
export class PaiementsController {
    constructor(private readonly paiementsService: PaiementsService) { }

    @Post()
    @ApiOperation({ summary: 'Enregistrer un nouveau paiement' })
    create(@Body() createPaiementDto: CreatePaiementDto, @Request() req) {
        return this.paiementsService.create(createPaiementDto, req.user.username);
    }

    @Get()
    @ApiOperation({ summary: 'Liste de tous les paiements' })
    findAll() {
        return this.paiementsService.findAll();
    }

    @Get('facture/:id')
    @ApiOperation({ summary: 'Historique des paiements d\'une facture' })
    findByFacture(@Param('id') id: string) {
        return this.paiementsService.findByFacture(+id);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Annuler un paiement' })
    @ApiResponse({ status: 200, description: 'Paiement annulé avec succès' })
    cancel(@Param('id') id: string) {
        return this.paiementsService.cancel(+id);
    }

    @Patch(':id/validate')
    @ApiOperation({ summary: 'Valider un paiement' })
    @ApiResponse({ status: 200, description: 'Paiement validé avec succès' })
    validate(@Param('id') id: string) {
        return this.paiementsService.validate(+id);
    }
}

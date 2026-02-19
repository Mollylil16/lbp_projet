import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CaisseService } from './caisse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MouvementType } from './entities/mouvement-caisse.entity';

@ApiTags('caisse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('caisse')
export class CaisseController {
    constructor(private readonly caisseService: CaisseService) { }

    @Post('appro')
    @ApiOperation({ summary: 'Enregistrer un approvisionnement' })
    createAppro(@Body() data: any, @Request() req) {
        return this.caisseService.createMovement(data, MouvementType.APPRO, req.user.username, req.user.id_agence);
    }

    @Post('decaissement')
    @ApiOperation({ summary: 'Enregistrer un décaissement' })
    createDecaissement(@Body() data: any, @Request() req) {
        return this.caisseService.createMovement(data, MouvementType.DECAISSEMENT, req.user.username, req.user.id_agence);
    }

    @Post('entree')
    @ApiOperation({ summary: 'Enregistrer une entrée de caisse' })
    createEntree(@Body() data: any, @Request() req) {
        // Déterminer le type d'entrée selon le mode de règlement
        let type: MouvementType = MouvementType.ENTREE_ESPECE; // Par défaut
        if (data.mode_reglement === 'CHEQUE') {
            type = MouvementType.ENTREE_CHEQUE;
        } else if (data.mode_reglement === 'VIREMENT') {
            type = MouvementType.ENTREE_VIREMENT;
        } else if (data.type) {
            // Si le type est spécifié directement dans le body
            type = data.type as MouvementType;
        }
        return this.caisseService.createMovement(data, type, req.user.username, req.user.id_agence);
    }

    @Get('mouvements')
    @ApiOperation({ summary: 'Liste des mouvements de caisse' })
    getMouvements(@Query() query: any, @Request() req) {
        return this.caisseService.getMouvements(query, req.user.id_agence);
    }

    @Get('solde')
    @ApiOperation({ summary: 'Récupérer le solde actuel' })
    async getSolde(@Query('id_caisse') id_caisse?: string, @Request() req?) {
        let finalCaisseId = id_caisse ? +id_caisse : undefined;
        if (!finalCaisseId && req?.user?.id_agence) {
            const caisses = await this.caisseService.findAllCaisses(req.user.id_agence);
            finalCaisseId = caisses[0]?.id;
        }
        const solde = await this.caisseService.getSolde(finalCaisseId || 1);
        return { solde };
    }

    @Get('point')
    @ApiOperation({ summary: 'Point de caisse journalier' })
    getPoint(@Query('date') date?: string, @Query('id_caisse') id_caisse?: string) {
        return this.caisseService.getPointCaisse(date, id_caisse ? +id_caisse : 1);
    }

    @Get('caisses')
    @ApiOperation({ summary: 'Liste des caisses' })
    getCaisses(@Request() req) {
        return this.caisseService.findAllCaisses(req.user.id_agence);
    }

    @Get('rapport-grandes-lignes')
    @ApiOperation({ summary: 'Rapport grandes lignes de caisse' })
    getRapportGrandesLignes(@Query() query: any) {
        return this.caisseService.getRapportGrandesLignes(query);
    }

    @Get('withdrawals')
    @ApiOperation({ summary: 'Liste spécifique des retraits (décaissements)' })
    getWithdrawals(@Query() query: any) {
        return this.caisseService.getMouvements({ ...query, type: MouvementType.DECAISSEMENT });
    }
}
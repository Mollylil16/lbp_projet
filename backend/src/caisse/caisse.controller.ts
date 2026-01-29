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
        return this.caisseService.createMovement(data, MouvementType.APPRO, req.user.username);
    }

    @Post('decaissement')
    @ApiOperation({ summary: 'Enregistrer un décaissement' })
    createDecaissement(@Body() data: any, @Request() req) {
        return this.caisseService.createMovement(data, MouvementType.DECAISSEMENT, req.user.username);
    }

    @Post('entree')
    @ApiOperation({ summary: 'Enregistrer une entrée de caisse' })
    createEntree(@Body() data: any, @Request() req) {
        return this.caisseService.createMovement(data, MouvementType.ENTREE, req.user.username);
    }

    @Get('mouvements')
    @ApiOperation({ summary: 'Liste des mouvements de caisse' })
    getMouvements(@Query() query: any) {
        return this.caisseService.getMouvements(query);
    }

    @Get('solde')
    @ApiOperation({ summary: 'Récupérer le solde actuel' })
    async getSolde(@Query('id_caisse') id_caisse?: string) {
        const solde = await this.caisseService.getSolde(id_caisse ? +id_caisse : 1);
        return { solde };
    }

    @Get('point')
    @ApiOperation({ summary: 'Point de caisse journalier' })
    getPoint(@Query('date') date?: string, @Query('id_caisse') id_caisse?: string) {
        return this.caisseService.getPointCaisse(date, id_caisse ? +id_caisse : 1);
    }

    @Get('caisses')
    @ApiOperation({ summary: 'Liste des caisses' })
    getCaisses() {
        return this.caisseService.findAllCaisses();
    }
}

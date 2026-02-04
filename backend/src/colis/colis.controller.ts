import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ColisService } from './colis.service';
import { CreateColisDto } from './dto/create-colis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('colis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('colis')
export class ColisController {
    constructor(private readonly colisService: ColisService) { }

    @Post()
    @ApiOperation({ summary: 'Créer un nouveau colis' })
    @ApiResponse({ status: 201, description: 'Colis créé avec succès' })
    create(@Body() createColisDto: CreateColisDto, @Request() req) {
        return this.colisService.create(createColisDto, req.user.username, req.user.id_agence);
    }

    @Post('groupage')
    @ApiOperation({ summary: 'Alias pour créer un colis groupage' })
    createGroupage(@Body() createColisDto: CreateColisDto, @Request() req) {
        return this.create(createColisDto, req);
    }

    @Post('autres-envois')
    @ApiOperation({ summary: 'Alias pour créer un colis autres envois' })
    createAutresEnvois(@Body() createColisDto: CreateColisDto, @Request() req) {
        return this.create(createColisDto, req);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Mettre à jour un colis existant' })
    @ApiResponse({ status: 200, description: 'Colis mis à jour avec succès' })
    update(
        @Param('id') id: string,
        @Body() updateColisDto: CreateColisDto,
        @Request() req,
    ) {
        return this.colisService.update(+id, updateColisDto, req.user.username, req.user.id_agence);
    }

    @Get()
    @ApiOperation({ summary: 'Liste des colis' })
    findAll(@Query() query) {
        return this.colisService.findAll(query);
    }

    @Get('search')
    @ApiOperation({ summary: 'Rechercher des colis' })
    search(@Query('search') searchTerm: string, @Query('forme_envoi') formeEnvoi: string) {
        return this.colisService.searchColis(searchTerm, formeEnvoi);
    }

    @Get('track/:ref')
    @ApiOperation({ summary: 'Suivi public d\'un colis' })
    track(@Param('ref') ref: string) {
        return this.colisService.trackColis(ref);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Détails d\'un colis' })
    findOne(@Param('id') id: string) {
        return this.colisService.findOne(+id);
    }

    @Patch(':id/validate')
    @ApiOperation({ summary: 'Valider un colis' })
    validate(@Param('id') id: string) {
        return this.colisService.validateColis(+id);
    }
}

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { AgencesService } from './agences.service';
import { Agence } from './entities/agence.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Agences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agences')
export class AgencesController {
    constructor(private readonly agencesService: AgencesService) { }

    @Get()
    @ApiOperation({ summary: 'Récupérer toutes les agences actives' })
    findAll() {
        return this.agencesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer une agence par son ID' })
    findOne(@Param('id') id: string) {
        return this.agencesService.findOne(+id);
    }

    @Post()
    @ApiOperation({ summary: 'Créer une nouvelle agence' })
    create(@Body() agenceData: Partial<Agence>) {
        return this.agencesService.create(agenceData);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Modifier une agence' })
    update(@Param('id') id: string, @Body() agenceData: Partial<Agence>) {
        return this.agencesService.update(+id, agenceData);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Désactiver une agence' })
    remove(@Param('id') id: string) {
        return this.agencesService.remove(+id);
    }
}

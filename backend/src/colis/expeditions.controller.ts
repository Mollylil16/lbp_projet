import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExpeditionsService } from './expeditions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpeditionStatut } from './entities/expedition.entity';

@Controller('expeditions')
@UseGuards(JwtAuthGuard)
export class ExpeditionsController {
    constructor(private readonly expeditionsService: ExpeditionsService) { }

    @Post()
    create(@Body() createExpeditionDto: any, @Request() req) {
        return this.expeditionsService.create(createExpeditionDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.expeditionsService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expeditionsService.findOne(+id);
    }

    @Post(':id/colis')
    addColis(@Param('id') id: string, @Body('colisIds') colisIds: number[]) {
        return this.expeditionsService.addColis(+id, colisIds);
    }

    @Delete(':id/colis/:colisId')
    removeColis(@Param('id') id: string, @Param('colisId') colisId: string) {
        return this.expeditionsService.removeColis(+id, +colisId);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('statut') statut: ExpeditionStatut) {
        return this.expeditionsService.updateStatus(+id, statut);
    }
}

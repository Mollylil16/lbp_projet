import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('recommendations')
    @ApiOperation({ summary: 'Obtenir des recommandations stratégiques basées sur l\'IA' })
    getRecommendations() {
        return this.analyticsService.getStrategicRecommendations();
    }

    @Get('chart-data')
    @ApiOperation({ summary: 'Données pour les graphiques du dashboard' })
    getChartData() {
        return this.analyticsService.getChartData();
    }

    @Get('traffic-repartition')
    @ApiOperation({ summary: 'Répartition du trafic par type' })
    getTrafficRepartition() {
        return this.analyticsService.getTrafficRepartition();
    }
}

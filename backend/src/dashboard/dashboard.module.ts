import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ColisModule } from '../colis/colis.module';
import { ClientsModule } from '../clients/clients.module';
import { FacturesModule } from '../factures/factures.module';
import { PaiementsModule } from '../paiements/paiements.module';
import { CaisseModule } from '../caisse/caisse.module';

@Module({
  imports: [
    ColisModule,
    ClientsModule,
    FacturesModule,
    PaiementsModule,
    CaisseModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule { }

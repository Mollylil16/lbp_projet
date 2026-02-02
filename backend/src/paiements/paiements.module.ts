import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaiementsService } from './paiements.service';
import { PaiementsController } from './paiements.controller';
import { Paiement } from './entities/paiement.entity';
import { Facture } from '../factures/entities/facture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paiement, Facture])],
  providers: [PaiementsService],
  controllers: [PaiementsController],
  exports: [PaiementsService, TypeOrmModule],
})
export class PaiementsModule { }

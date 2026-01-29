import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturesService } from './factures.service';
import { FacturesController } from './factures.controller';
import { Facture } from './entities/facture.entity';
import { Colis } from '../colis/entities/colis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facture, Colis])],
  providers: [FacturesService],
  controllers: [FacturesController],
  exports: [FacturesService],
})
export class FacturesModule { }

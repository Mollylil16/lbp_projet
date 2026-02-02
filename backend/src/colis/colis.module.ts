import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColisService } from './colis.service';
import { ColisController } from './colis.controller';
import { Colis, Marchandise } from './entities/colis.entity';
import { Client } from '../clients/entities/client.entity';
import { FacturesModule } from '../factures/factures.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Colis, Marchandise, Client]),
    FacturesModule,
  ],
  providers: [ColisService],
  controllers: [ColisController],
  exports: [ColisService, TypeOrmModule],
})
export class ColisModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseService } from './caisse.service';
import { CaisseController } from './caisse.controller';
import { Caisse } from './entities/caisse.entity';
import { MouvementCaisse } from './entities/mouvement-caisse.entity';
import { Agence } from '../agences/entities/agence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caisse, MouvementCaisse, Agence])],
  providers: [CaisseService],
  controllers: [CaisseController],
  exports: [CaisseService],
})
export class CaisseModule { }

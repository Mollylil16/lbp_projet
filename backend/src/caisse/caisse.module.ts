import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseService } from './caisse.service';
import { CaisseController } from './caisse.controller';
import { Caisse } from './entities/caisse.entity';
import { MouvementCaisse } from './entities/mouvement-caisse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caisse, MouvementCaisse])],
  providers: [CaisseService],
  controllers: [CaisseController],
  exports: [CaisseService],
})
export class CaisseModule { }

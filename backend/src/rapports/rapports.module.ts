import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RapportsService } from './rapports.service';
import { RapportsController } from './rapports.controller';
import { Colis } from '../colis/entities/colis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Colis])],
  providers: [RapportsService],
  controllers: [RapportsController],
})
export class RapportsModule { }

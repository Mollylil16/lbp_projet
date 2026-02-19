import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agence } from './entities/agence.entity';
import { AgencesService } from './agences.service';
import { AgencesController } from './agences.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Agence])],
    providers: [AgencesService],
    controllers: [AgencesController],
    exports: [AgencesService, TypeOrmModule],
})
export class AgencesModule { }

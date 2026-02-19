import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifsService } from './tarifs.service';
import { TarifsController } from './tarifs.controller';
import { Tarif } from './entities/tarif.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tarif])],
    controllers: [TarifsController],
    providers: [TarifsService],
    exports: [TarifsService],
})
export class TarifsModule { }

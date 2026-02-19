import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TarifsService } from './tarifs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tarifs')
@UseGuards(JwtAuthGuard)
export class TarifsController {
    constructor(private readonly tarifsService: TarifsService) { }

    @Post()
    create(@Body() createTarifDto: any) {
        return this.tarifsService.create(createTarifDto);
    }

    @Get()
    findAll() {
        return this.tarifsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tarifsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTarifDto: any) {
        return this.tarifsService.update(+id, +updateTarifDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tarifsService.remove(+id);
    }
}

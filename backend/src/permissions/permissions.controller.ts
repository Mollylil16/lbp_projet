import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionModule } from './entities/permission.entity';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Post()
    create(@Body() createPermissionDto: CreatePermissionDto) {
        return this.permissionsService.create(createPermissionDto);
    }

    @Get()
    findAll() {
        return this.permissionsService.findAll();
    }

    @Get('module/:module')
    findByModule(@Param('module') module: PermissionModule) {
        return this.permissionsService.findByModule(module);
    }

    @Get('actions-speciales')
    getAllActionsSpeciales() {
        return this.permissionsService.getAllActionsSpeciales();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.permissionsService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.permissionsService.remove(+id);
    }
}

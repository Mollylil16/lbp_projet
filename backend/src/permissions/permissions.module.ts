import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { ActionSpeciale } from './entities/action-speciale.entity';
import { UserActionSpeciale } from '../users/entities/user-action-speciale.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Permission, RolePermission, ActionSpeciale, UserActionSpeciale])],
    controllers: [PermissionsController],
    providers: [PermissionsService],
    exports: [PermissionsService],
})
export class PermissionsModule { }

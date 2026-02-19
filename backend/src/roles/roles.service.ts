import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RolePermission } from '../permissions/entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
        @InjectRepository(RolePermission)
        private rolePermissionsRepository: Repository<RolePermission>,
    ) { }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const existingRole = await this.rolesRepository.findOne({
            where: { code: createRoleDto.code },
        });

        if (existingRole) {
            throw new ConflictException(`Le rôle avec le code ${createRoleDto.code} existe déjà`);
        }

        const role = this.rolesRepository.create(createRoleDto);
        return await this.rolesRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return await this.rolesRepository.find({
            relations: ['rolePermissions', 'rolePermissions.permission'],
            order: { niveau_hierarchique: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Role> {
        const role = await this.rolesRepository.findOne({
            where: { id },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });

        if (!role) {
            throw new NotFoundException(`Rôle avec l'ID ${id} non trouvé`);
        }

        return role;
    }

    async findByCode(code: string): Promise<Role> {
        const role = await this.rolesRepository.findOne({
            where: { code },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        });

        if (!role) {
            throw new NotFoundException(`Rôle avec le code ${code} non trouvé`);
        }

        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);

        if (updateRoleDto.code && updateRoleDto.code !== role.code) {
            const existingRole = await this.rolesRepository.findOne({
                where: { code: updateRoleDto.code },
            });

            if (existingRole) {
                throw new ConflictException(`Le rôle avec le code ${updateRoleDto.code} existe déjà`);
            }
        }

        Object.assign(role, updateRoleDto);
        return await this.rolesRepository.save(role);
    }

    async remove(id: number): Promise<void> {
        const role = await this.findOne(id);
        await this.rolesRepository.remove(role);
    }

    async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
        const role = await this.findOne(roleId);

        // Supprimer les permissions existantes
        await this.rolePermissionsRepository.delete({ role: { id: roleId } });

        // Ajouter les nouvelles permissions
        for (const permissionId of permissionIds) {
            const permission = await this.permissionsRepository.findOne({
                where: { id: permissionId },
            });

            if (!permission) {
                throw new NotFoundException(`Permission avec l'ID ${permissionId} non trouvée`);
            }

            const rolePermission = this.rolePermissionsRepository.create({
                role,
                permission,
            });

            await this.rolePermissionsRepository.save(rolePermission);
        }

        return await this.findOne(roleId);
    }

    async getPermissions(roleId: number): Promise<Permission[]> {
        const role = await this.findOne(roleId);
        return role.rolePermissions.map((rp) => rp.permission);
    }
}

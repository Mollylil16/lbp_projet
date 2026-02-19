import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.roleEntity) {
            return false;
        }

        // Si l'utilisateur est SUPER_ADMIN, il a tous les droits
        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        // Récupérer les permissions du rôle de l'utilisateur
        const userPermissions = user.roleEntity.rolePermissions?.map(
            (rp) => rp.permission.code,
        ) || [];

        // Vérifier si l'utilisateur a au moins une des permissions requises
        return requiredPermissions.some((permission) => userPermissions.includes(permission));
    }
}

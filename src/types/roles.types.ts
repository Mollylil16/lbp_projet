export interface Role {
    id: number;
    code: string;
    libelle: string;
    description?: string;
    niveau_hierarchique: number;
    est_actif: boolean;
    created_at: Date;
    updated_at: Date;
}

export enum PermissionModule {
    EXPLOITATION = 'EXPLOITATION',
    FACTURATION = 'FACTURATION',
    OPERATION_CAISSE = 'OPERATION_CAISSE',
    GESTION_FONDS = 'GESTION_FONDS',
    RAPPORTS = 'RAPPORTS',
    STRUCTURES = 'STRUCTURES',
}

export enum PermissionAction {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export interface Permission {
    id: number;
    module: PermissionModule;
    fonctionnalite: string;
    action: PermissionAction;
    code: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface RolePermission {
    id: number;
    role: Role;
    permission: Permission;
    created_at: Date;
}

export enum ActionSpecialeType {
    RESTRICTION = 'RESTRICTION',
    PRIVILEGE = 'PRIVILEGE',
}

export interface ActionSpeciale {
    id: number;
    code: string;
    libelle: string;
    description?: string;
    type: ActionSpecialeType;
    created_at: Date;
    updated_at: Date;
}

export interface UserActionSpeciale {
    id: number;
    user: any; // Référence à User
    actionSpeciale: ActionSpeciale;
    created_at: Date;
}

export interface CreateRoleDto {
    code: string;
    libelle: string;
    description?: string;
    niveau_hierarchique?: number;
    est_actif?: boolean;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> { }

export interface AssignPermissionsToRoleDto {
    roleId: number;
    permissionIds: number[];
}

export interface RoleWithPermissions extends Role {
    rolePermissions: RolePermission[];
}

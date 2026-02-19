import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';

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

@Entity('lbp_permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: PermissionModule,
    })
    module: PermissionModule;

    @Column({ length: 100 })
    fonctionnalite: string; // 'groupage_colis', 'cotation', 'reglement_client', etc.

    @Column({
        type: 'enum',
        enum: PermissionAction,
    })
    action: PermissionAction;

    @Column({ unique: true, length: 150 })
    code: string; // 'exploitation.groupage_colis.create'

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolePermissions: RolePermission[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

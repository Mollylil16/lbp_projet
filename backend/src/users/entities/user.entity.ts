import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Agence } from '../../agences/entities/agence.entity';
import { Role } from '../../roles/entities/role.entity';
import { UserActionSpeciale } from './user-action-speciale.entity';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    OPERATEUR_COLIS = 'OPERATEUR_COLIS',
    VALIDATEUR = 'VALIDATEUR',
    CAISSIER = 'CAISSIER',
    AGENCE_MANAGER = 'AGENCE_MANAGER',
    LECTURE_SEULE = 'LECTURE_SEULE',
}

@Entity('lbp_users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ select: false }) // Hide password by default
    password: string;

    @Column()
    fullname: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.OPERATEUR_COLIS,
    })
    role: UserRole;

    @Column({ type: 'int', default: 2 }) // Mapping to CODEACCES from STTINTER
    code_acces: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Agence, (agence) => agence.users, { nullable: true })
    @JoinColumn({ name: 'id_agence' })
    agence: Agence;

    // Nouveau système de rôles et permissions
    @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: true })
    @JoinColumn({ name: 'role_id' })
    roleEntity: Role;

    @Column({ default: false })
    peut_voir_toutes_agences: boolean;

    @OneToMany(() => UserActionSpeciale, (userAction) => userAction.user, { eager: true })
    actionsSpeciales: UserActionSpeciale[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

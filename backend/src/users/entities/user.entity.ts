import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

    @Column({ nullable: true })
    id_agence: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

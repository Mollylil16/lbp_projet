import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MouvementCaisse } from './mouvement-caisse.entity';

@Entity('lbp_caisses')
export class Caisse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    solde_initial: number;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => MouvementCaisse, (mouvement: MouvementCaisse) => mouvement.caisse)
    mouvements: MouvementCaisse[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

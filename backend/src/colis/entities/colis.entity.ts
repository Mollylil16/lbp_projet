import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('lbp_colis')
export class Colis {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    ref_colis: string; // format généré: LBP-MMYY-XXX

    @Column()
    trafic_envoi: string; // ex: Import Aérien, etc.

    @Column({ default: 'groupage' })
    forme_envoi: string; // groupage, autres_envoi

    @Column({ nullable: true })
    mode_envoi: string; // ex: DHL, etc.

    @Column({ type: 'date' })
    date_envoi: Date;

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'id_client' })
    client: Client;

    // Receveur / Destinataire
    @Column()
    nom_dest: string;

    @Column({ nullable: true })
    lieu_dest: string;

    @Column({ nullable: true })
    tel_dest: string;

    @Column({ nullable: true })
    email_dest: string;

    // Récupérateur (si différent)
    @Column({ nullable: true })
    nom_recup: string;

    @Column({ nullable: true })
    adresse_recup: string;

    @Column({ nullable: true })
    tel_recup: string;

    @Column({ nullable: true })
    email_recup: string;

    @Column({ default: 0 })
    etat_validation: number; // 0: Brouillon, 1: Validé

    @Column({ nullable: true })
    code_user: string;

    @Column({ nullable: true })
    id_agence: number;

    @OneToMany(() => Marchandise, (marchandise) => marchandise.colis, { cascade: true })
    marchandises: Marchandise[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

@Entity('lbp_marchandises')
export class Marchandise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nom_marchandise: string;

    @Column({ type: 'int', default: 1 })
    nbre_colis: number;

    @Column({ type: 'int', default: 1 })
    nbre_articles: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    poids_total: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    prix_unit: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    prix_emballage: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    prix_assurance: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    prix_agence: number;

    @ManyToOne(() => Colis, (colis) => colis.marchandises)
    @JoinColumn({ name: 'id_colis' })
    colis: Colis;
}

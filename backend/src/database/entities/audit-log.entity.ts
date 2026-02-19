import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    userId: string;

    @Column()
    action: string;

    @Column()
    entity: string;

    @Column({ nullable: true })
    entityId: string;

    @Column({ type: 'jsonb', nullable: true })
    details: any;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ type: 'int', nullable: true })
    duration: number;

    @Column()
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}

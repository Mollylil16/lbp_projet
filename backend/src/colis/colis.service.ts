import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Colis, Marchandise } from './entities/colis.entity';
import { CreateColisDto } from './dto/create-colis.dto';
import { Client } from '../clients/entities/client.entity';
import { FacturesService } from '../factures/factures.service';

@Injectable()
export class ColisService {
    constructor(
        @InjectRepository(Colis)
        private colisRepository: Repository<Colis>,
        @InjectRepository(Marchandise)
        private marchandiseRepository: Repository<Marchandise>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        private facturesService: FacturesService,
        private dataSource: DataSource,
    ) { }

    async create(createColisDto: CreateColisDto, userId: string, agenceId?: number): Promise<Colis> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id_client, marchandises, ...colisData } = createColisDto;

            // 1. Check client
            const client = await this.clientRepository.findOne({ where: { id: id_client } });
            if (!client) {
                throw new NotFoundException(`Client with ID ${id_client} not found`);
            }

            // 2. Generate reference
            const refColis = await this.generateReference();

            // 3. Create Colis
            const colis = this.colisRepository.create({
                ...colisData,
                ref_colis: refColis,
                client,
                code_user: userId,
                id_agence: agenceId,
                date_envoi: new Date(createColisDto.date_envoi),
            });

            const savedColis = await queryRunner.manager.save(colis);

            // 4. Create Marchandises
            if (marchandises && marchandises.length > 0) {
                const marchandiseEntities = marchandises.map((m) =>
                    this.marchandiseRepository.create({
                        ...m,
                        colis: savedColis,
                    }),
                );
                await queryRunner.manager.save(marchandiseEntities);
                savedColis.marchandises = marchandiseEntities;
            }

            await queryRunner.commitTransaction();
            return savedColis;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private async generateReference(): Promise<string> {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const datePart = `${mm}${yy}`;

        // Find the last reference for this month/year
        const lastColis = await this.colisRepository
            .createQueryBuilder('colis')
            .where('colis.ref_colis LIKE :pattern', { pattern: `LBP-${datePart}-%` })
            .orderBy('colis.id', 'DESC')
            .getOne();

        let nextNumber = 1;
        if (lastColis) {
            const lastRef = lastColis.ref_colis;
            const parts = lastRef.split('-');
            const lastNum = parseInt(parts[2], 10);
            nextNumber = lastNum + 1;
        }

        const numPart = String(nextNumber).padStart(3, '0');
        return `LBP-${datePart}-${numPart}`;
    }

    async findAll(query: any): Promise<Colis[]> {
        return this.colisRepository.find({
            relations: ['client', 'marchandises'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Colis> {
        const colis = await this.colisRepository.findOne({
            where: { id },
            relations: ['client', 'marchandises'],
        });
        if (!colis) {
            throw new NotFoundException(`Colis #${id} not found`);
        }
        return colis;
    }

    async validateColis(id: number): Promise<Colis> {
        const colis = await this.findOne(id);
        colis.etat_validation = 1;
        return await this.colisRepository.save(colis);
    }

    async searchColis(searchTerm: string, formeEnvoi?: string): Promise<Colis[]> {
        const query = this.colisRepository.createQueryBuilder('colis')
            .leftJoinAndSelect('colis.client', 'client')
            .leftJoinAndSelect('colis.marchandises', 'marchandises')
            .where('(colis.ref_colis ILIKE :search OR client.nom_exp ILIKE :search OR colis.nom_dest ILIKE :search)', { search: `%${searchTerm}%` });

        if (formeEnvoi) {
            query.andWhere('colis.forme_envoi = :formeEnvoi', { formeEnvoi });
        }

        return await query.getMany();
    }

    async trackColis(refColis: string): Promise<any> {
        const colis = await this.colisRepository.findOne({
            where: { ref_colis: refColis },
            relations: ['client', 'marchandises'],
        });

        if (!colis) {
            throw new NotFoundException(`Colis ${refColis} not found`);
        }

        // Simuler des étapes de suivi basées sur l'état
        const steps = [
            { title: 'Colis enregistré', date: colis.created_at, location: 'Agence LBP' },
        ];

        if (colis.etat_validation === 1) {
            steps.push({ title: 'Colis validé et prêt pour expédition', date: colis.updated_at, location: 'Entrepôt LBP' });
        }

        return {
            ref_colis: colis.ref_colis,
            status: colis.etat_validation === 1 ? 'En cours' : 'Brouillon',
            current_location: 'Agence LBP',
            steps,
            client_colis: colis.client,
            colis,
        };
    }
}

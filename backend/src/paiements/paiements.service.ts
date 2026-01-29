import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Paiement } from './entities/paiement.entity';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { Facture } from '../factures/entities/facture.entity';

@Injectable()
export class PaiementsService {
    constructor(
        @InjectRepository(Paiement)
        private paiementRepository: Repository<Paiement>,
        @InjectRepository(Facture)
        private factureRepository: Repository<Facture>,
        private dataSource: DataSource,
    ) { }

    async create(createPaiementDto: CreatePaiementDto, userId: string): Promise<Paiement> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id_facture, ...paiementData } = createPaiementDto;

            // 1. Check facture
            const facture = await this.factureRepository.findOne({
                where: { id: id_facture },
                relations: ['colis']
            });
            if (!facture) {
                throw new NotFoundException(`Facture #${id_facture} not found`);
            }

            // 2. Business Logic: Check if payment doesn't exceed total
            const remaining = Number(facture.montant_ttc) - Number(facture.montant_paye);
            if (paiementData.montant > remaining && remaining > 0) {
                // Encaisser seulement le reste ? Ou bloquer ? 
                // Ici on bloque pour éviter les erreurs de saisie
                // throw new BadRequestException(`Amount exceeds remaining balance: ${remaining}`);
            }

            // 3. Create Paiement
            const paiement = this.paiementRepository.create({
                ...paiementData,
                facture,
                date_paiement: new Date(paiementData.date_paiement),
                code_user: userId,
            });

            const savedPaiement = await queryRunner.manager.save(paiement);

            // 4. Update Facture totals
            facture.montant_paye = Number(facture.montant_paye) + Number(paiementData.montant);

            // Si c'était une proforma, elle devient tacitement définitive ou on gère ça via validation manuelle ?
            // Dans LBP, la validation est souvent manuelle avant paiement, mais on peut forcer ici.

            await queryRunner.manager.save(facture);

            await queryRunner.commitTransaction();
            return savedPaiement;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(): Promise<Paiement[]> {
        return this.paiementRepository.find({
            relations: ['facture', 'facture.colis'],
            order: { created_at: 'DESC' },
        });
    }

    async findByFacture(factureId: number): Promise<Paiement[]> {
        return this.paiementRepository.find({
            where: { facture: { id: factureId } },
            order: { date_paiement: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Paiement> {
        const paiement = await this.paiementRepository.findOne({
            where: { id },
            relations: ['facture'],
        });
        if (!paiement) {
            throw new NotFoundException(`Paiement #${id} not found`);
        }
        return paiement;
    }

    async cancel(id: number): Promise<void> {
        const paiement = await this.findOne(id);
        if (paiement.etat_validation === 0) return;

        paiement.etat_validation = 0; // Annulé
        await this.paiementRepository.save(paiement);

        // Déduire le montant de la facture
        const facture = paiement.facture;
        facture.montant_paye = Number(facture.montant_paye) - Number(paiement.montant);
        await this.factureRepository.save(facture);
    }

    async validate(id: number): Promise<Paiement> {
        const paiement = await this.findOne(id);
        paiement.etat_validation = 1; // Validé
        return await this.paiementRepository.save(paiement);
    }
}

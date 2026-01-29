import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Facture } from './entities/facture.entity';
import { Colis } from '../colis/entities/colis.entity';

@Injectable()
export class FacturesService {
    constructor(
        @InjectRepository(Facture)
        private factureRepository: Repository<Facture>,
        @InjectRepository(Colis)
        private colisRepository: Repository<Colis>,
        private dataSource: DataSource,
    ) { }

    async createProforma(colis: Colis, userId: string): Promise<Facture> {
        const numFacture = await this.generateReference();

        // Calcul des montants basés sur les marchandises du colis
        let montantHT = 0;
        if (colis.marchandises) {
            montantHT = colis.marchandises.reduce((acc, m) => {
                const totalLigne =
                    Number(m.prix_unit) * Number(m.nbre_articles) +
                    Number(m.prix_emballage) +
                    Number(m.prix_assurance) +
                    Number(m.prix_agence);
                return acc + totalLigne;
            }, 0);
        }

        const facture = this.factureRepository.create({
            num_facture: numFacture,
            colis: colis,
            montant_ht: montantHT,
            montant_ttc: montantHT, // TODO: Appliquer taxes si nécessaire
            montant_paye: 0,
            etat: 0, // Proforma
            date_facture: new Date(),
            code_user: userId,
        });

        return await this.factureRepository.save(facture);
    }

    private async generateReference(): Promise<string> {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const datePart = `${mm}${yy}`;

        const lastFacture = await this.factureRepository
            .createQueryBuilder('facture')
            .where('facture.num_facture LIKE :pattern', { pattern: `FCO-${datePart}-%` })
            .orderBy('facture.id', 'DESC')
            .getOne();

        let nextNumber = 1;
        if (lastFacture) {
            const lastRef = lastFacture.num_facture;
            const parts = lastRef.split('-');
            const lastNum = parseInt(parts[2], 10);
            nextNumber = lastNum + 1;
        }

        const numPart = String(nextNumber).padStart(3, '0');
        return `FCO-${datePart}-${numPart}`;
    }

    async findAll(): Promise<Facture[]> {
        return this.factureRepository.find({
            relations: ['colis', 'colis.client'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Facture> {
        const facture = await this.factureRepository.findOne({
            where: { id },
            relations: ['colis', 'colis.client', 'colis.marchandises'],
        });
        if (!facture) {
            throw new NotFoundException(`Facture #${id} not found`);
        }
        return facture;
    }

    async validateProforma(id: number): Promise<Facture> {
        const facture = await this.findOne(id);
        facture.etat = 1; // Définitive
        return await this.factureRepository.save(facture);
    }

    async findByColisRef(refColis: string): Promise<Facture | null> {
        return this.factureRepository.findOne({
            where: { colis: { ref_colis: refColis } },
            relations: ['colis', 'colis.client'],
        });
    }

    async cancelFacture(id: number): Promise<void> {
        const facture = await this.findOne(id);
        facture.etat = 2; // Annulée
        await this.factureRepository.save(facture);
    }

    async generatePDF(id: number): Promise<Buffer> {
        // Mock PDF generation - return a simple Buffer
        return Buffer.from('PDF Content Mock for Facture #' + id);
    }
}

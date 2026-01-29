import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Caisse } from './entities/caisse.entity';
import { MouvementCaisse, MouvementType } from './entities/mouvement-caisse.entity';

@Injectable()
export class CaisseService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(Caisse)
        private caisseRepository: Repository<Caisse>,
        @InjectRepository(MouvementCaisse)
        private mouvementRepository: Repository<MouvementCaisse>,
    ) { }

    async onApplicationBootstrap() {
        // S'assurer qu'il existe au moins une caisse par défaut
        const count = await this.caisseRepository.count();
        if (count === 0) {
            await this.caisseRepository.save({
                nom: 'Caisse Principale',
                solde_initial: 0,
            });
            console.log('Default cash register created');
        }
    }

    async createMovement(data: any, type: MouvementType, userId: string): Promise<MouvementCaisse> {
        const caisseId = data.id_caisse || 1; // Default to ID 1 if not provided
        const caisse = await this.caisseRepository.findOne({ where: { id: caisseId } });

        if (!caisse) {
            throw new NotFoundException(`Caisse #${caisseId} not found`);
        }

        const mouvement = this.mouvementRepository.create({
            ...data,
            type,
            caisse,
            code_user: userId,
            date_mouvement: data.date_mouvement ? new Date(data.date_mouvement) : new Date(),
        } as MouvementCaisse);

        return await this.mouvementRepository.save(mouvement);
    }

    async getMouvements(params: any): Promise<MouvementCaisse[]> {
        const { id_caisse, date_debut, date_fin, type } = params;
        const where: any = {};

        if (id_caisse) where.caisse = { id: id_caisse };
        if (type) where.type = type;
        if (date_debut && date_fin) {
            where.date_mouvement = Between(new Date(date_debut), new Date(date_fin));
        }

        return this.mouvementRepository.find({
            where,
            order: { created_at: 'DESC' },
            relations: ['caisse'],
        });
    }

    async getSolde(id_caisse: number = 1): Promise<number> {
        const caisse = await this.caisseRepository.findOne({ where: { id: id_caisse } });
        if (!caisse) return 0;

        const mouvements = await this.mouvementRepository.find({
            where: { caisse: { id: id_caisse } }
        });

        const total = mouvements.reduce((acc, mv) => {
            if (mv.type === MouvementType.DECAISSEMENT) {
                return acc - Number(mv.montant);
            }
            return acc + Number(mv.montant);
        }, Number(caisse.solde_initial));

        return total;
    }

    async getPointCaisse(date?: string, id_caisse: number = 1): Promise<any> {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const mouvements = await this.mouvementRepository.find({
            where: {
                caisse: { id: id_caisse },
                date_mouvement: Between(startOfDay, endOfDay),
            }
        });

        const entrees = mouvements
            .filter(m => m.type !== MouvementType.DECAISSEMENT)
            .reduce((sum, m) => sum + Number(m.montant), 0);

        const sorties = mouvements
            .filter(m => m.type === MouvementType.DECAISSEMENT)
            .reduce((sum, m) => sum + Number(m.montant), 0);

        const solde = await this.getSolde(id_caisse);

        return {
            date: startOfDay,
            entrees,
            sorties,
            solde,
            mouvementsCount: mouvements.length,
        };
    }

    async findAllCaisses(): Promise<Caisse[]> {
        return this.caisseRepository.find();
    }
}

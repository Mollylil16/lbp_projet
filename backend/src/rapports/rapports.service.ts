import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Colis } from '../colis/entities/colis.entity';

@Injectable()
export class RapportsService {
    constructor(
        @InjectRepository(Colis)
        private colisRepository: Repository<Colis>,
    ) { }

    async generateRapportColis(params: any): Promise<Colis[]> {
        const { start_date, end_date, trafic_envoi, mode_envoi, forme_envoi, client_id } = params;
        const where: any = {};

        if (start_date && end_date) {
            where.date_envoi = Between(new Date(start_date), new Date(end_date));
        }
        if (trafic_envoi) where.trafic_envoi = trafic_envoi;
        if (mode_envoi) where.mode_envoi = mode_envoi;
        if (forme_envoi) where.forme_envoi = forme_envoi;
        if (client_id) where.client = { id: client_id };

        return this.colisRepository.find({
            where,
            relations: ['client', 'marchandises'],
            order: { date_envoi: 'DESC' },
        });
    }

    async exportExcel(params: any): Promise<Buffer> {
        // Mocking Excel export
        return Buffer.from('Mock Excel Content for period ' + params.start_date + ' to ' + params.end_date);
    }

    async exportPDF(params: any): Promise<Buffer> {
        // Mocking PDF export
        return Buffer.from('Mock PDF Content for period ' + params.start_date + ' to ' + params.end_date);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agence } from './entities/agence.entity';

@Injectable()
export class AgencesService {
    constructor(
        @InjectRepository(Agence)
        private agencesRepository: Repository<Agence>,
    ) { }

    async findAll(): Promise<Agence[]> {
        return this.agencesRepository.find({ where: { actif: true } });
    }

    async findOne(id: number): Promise<Agence> {
        const agence = await this.agencesRepository.findOne({ where: { id } });
        if (!agence) {
            throw new NotFoundException(`Agence with ID ${id} not found`);
        }
        return agence;
    }

    async create(agenceData: Partial<Agence>): Promise<Agence> {
        const agence = this.agencesRepository.create(agenceData);
        return this.agencesRepository.save(agence);
    }

    async update(id: number, agenceData: Partial<Agence>): Promise<Agence> {
        await this.agencesRepository.update(id, agenceData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.agencesRepository.update(id, { actif: false });
    }
}

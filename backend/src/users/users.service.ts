import { Injectable, ConflictException, InternalServerErrorException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onApplicationBootstrap() {
        await this.createDefaultAdmin();
    }

    async create(userData: Partial<User>): Promise<User> {
        try {
            const { password, ...rest } = userData;
            if (!password) {
                throw new InternalServerErrorException('Password is required');
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = this.usersRepository.create({
                ...rest,
                password: hashedPassword,
            } as User);

            return await this.usersRepository.save(user);
        } catch (error: any) {
            if (error.code === '23505') { // Code d'erreur PostgreSQL pour violation de contrainte unique
                throw new ConflictException('Username already exists');
            }
            throw error;
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username },
            select: ['id', 'username', 'password', 'fullname', 'role', 'code_acces', 'id_agence', 'isActive']
        });
    }

    async findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    // Méthode pour l'initialisation (Seed) d'un admin par défaut
    async createDefaultAdmin() {
        const admin = await this.findByUsername('admin');
        if (!admin) {
            await this.create({
                username: 'admin',
                password: 'adminpassword', // À changer immédiatement
                fullname: 'Administrateur Système',
                role: UserRole.SUPER_ADMIN,
                code_acces: 2,
                isActive: true,
            });
            console.log('Default admin created: admin / adminpassword');
        }
    }
}

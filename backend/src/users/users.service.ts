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
            select: ['id', 'username', 'password', 'fullname', 'role', 'code_acces', 'agence' as any, 'isActive']
        });
    }

    async findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'username', 'fullname', 'role', 'code_acces', 'agence' as any, 'isActive', 'created_at'],
            order: { created_at: 'DESC' }
        });
    }

    // Méthode pour l'initialisation (Seed) de tous les utilisateurs de test
    async createDefaultAdmin() {
        // Liste de tous les utilisateurs de test à créer
        const testUsers = [
            {
                username: 'admin',
                password: 'adminpassword',
                fullname: 'Administrateur Système',
                role: UserRole.SUPER_ADMIN,
                code_acces: 2,
            },
            {
                username: 'manager',
                password: 'manager123',
                fullname: 'Manager Principal',
                role: UserRole.ADMIN,
                code_acces: 1,
            },
            {
                username: 'operateur',
                password: 'operateur123',
                fullname: 'Opérateur Colis',
                role: UserRole.OPERATEUR_COLIS,
                code_acces: 1,
            },
            {
                username: 'caissier',
                password: 'caissier123',
                fullname: 'Caissier',
                role: UserRole.CAISSIER,
                code_acces: 1,
            },
            {
                username: 'validateur',
                password: 'validateur123',
                fullname: 'Validateur',
                role: UserRole.VALIDATEUR,
                code_acces: 1,
            },
        ];

        for (const userData of testUsers) {
            await this.createOrResetTestUser(userData);
        }
    }

    // Créer ou réinitialiser un utilisateur de test
    async createOrResetTestUser(userData: {
        username: string;
        password: string;
        fullname: string;
        role: UserRole;
        code_acces: number;
    }) {
        const existingUser = await this.findByUsername(userData.username);

        if (!existingUser) {
            // Créer l'utilisateur s'il n'existe pas
            await this.create({
                ...userData,
                isActive: true,
            });
            console.log(`✅ User created: ${userData.username} / ${userData.password}`);
        } else {
            // Vérifier et réinitialiser le mot de passe si nécessaire
            const isPasswordCorrect = await bcrypt.compare(userData.password, existingUser.password);
            if (!isPasswordCorrect) {
                console.log(`⚠️  User ${userData.username} exists but password is different. Resetting...`);
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                existingUser.password = hashedPassword;
                existingUser.isActive = true; // S'assurer que l'utilisateur est actif
                await this.usersRepository.save(existingUser);
                console.log(`✅ User ${userData.username} password reset to: ${userData.password}`);
            } else {
                // S'assurer que l'utilisateur est actif
                if (!existingUser.isActive) {
                    existingUser.isActive = true;
                    await this.usersRepository.save(existingUser);
                    console.log(`✅ User ${userData.username} activated`);
                } else {
                    console.log(`✅ User ${userData.username} already exists with correct password`);
                }
            }
        }
    }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            code_acces: user.code_acces,
            id_agence: user.id_agence
        };
        return {
            token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
            user: {
                id: user.id,
                username: user.username,
                full_name: user.fullname,
                role: user.role,
                code_acces: user.code_acces,
                id_agence: user.id_agence,
                isActive: user.isActive,
            },
            permissions: this.getPermissionsForUser(user),
        };
    }

    getPermissionsForUser(user: any): string[] {
        // Dans lbp-frontend/src/constants/permissions.ts, CODEACCES 2 est Super Admin (*)
        if (user.code_acces === 2 || user.role === 'SUPER_ADMIN') {
            return ['*'];
        }
        // TODO: Implémenter une logique de mapping plus fine si nécessaire
        return [user.role.toLowerCase()];
    }
}

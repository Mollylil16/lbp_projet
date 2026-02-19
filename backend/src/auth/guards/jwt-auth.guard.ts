import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        // Support for mock tokens in development mode
        if (process.env.NODE_ENV !== 'production' && authHeader && authHeader.startsWith('Bearer mock_token_')) {
            const token = authHeader.split(' ')[1];
            const username = token.split('_')[2]; // Format: mock_token_username_timestamp

            if (username) {
                // Populate request.user with a mock user object
                // This should match the expected structure in the backend
                request.user = {
                    id: 999, // Dummy ID for mock users
                    username: username,
                    role: this.getRoleByUsername(username),
                    id_agence: null,
                    isMock: true
                };
                return true;
            }
        }

        // Default JWT authentication
        try {
            const result = await super.canActivate(context);
            return result as boolean;
        } catch (e) {
            throw e;
        }
    }

    private getRoleByUsername(username: string): string {
        const mockRoles: Record<string, string> = {
            admin: 'SUPER_ADMIN',
            manager: 'ADMIN',
            operateur: 'OPERATEUR_COLIS',
            validateur: 'VALIDATEUR',
            caissier: 'CAISSIER',
            agence: 'AGENCE_MANAGER',
            lecteur: 'LECTURE_SEULE',
        };
        return mockRoles[username.toLowerCase()] || 'OPERATEUR_COLIS';
    }
}

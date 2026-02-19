import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seeder';
import { seedPermissions } from './permissions.seeder';
import { seedActionsSpeciales } from './actions-speciales.seeder';
import { seedRolePermissions } from './role-permissions.seeder';

export async function runAllSeeders(dataSource: DataSource): Promise<void> {
    console.log('🌱 Démarrage des seeders...\n');

    try {
        console.log('📝 Création des rôles...');
        await seedRoles(dataSource);
        console.log('✅ Rôles créés\n');

        console.log('📝 Création des permissions...');
        await seedPermissions(dataSource);
        console.log('✅ Permissions créées\n');

        console.log('📝 Création des actions spéciales...');
        await seedActionsSpeciales(dataSource);
        console.log('✅ Actions spéciales créées\n');

        console.log('📝 Association des permissions aux rôles...');
        await seedRolePermissions(dataSource);
        console.log('✅ Associations créées\n');

        console.log('🎉 Tous les seeders ont été exécutés avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution des seeders:', error);
        throw error;
    }
}

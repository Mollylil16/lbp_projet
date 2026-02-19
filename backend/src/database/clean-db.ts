import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

async function cleanDatabase() {
    const configService = new ConfigService();

    const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
    });

    try {
        await dataSource.initialize();
        console.log('✅ Connexion à la base de données établie\n');

        console.log('🗑️  Suppression des anciennes tables...\n');

        // Supprimer les tables dans le bon ordre (contraintes)
        await dataSource.query('DROP TABLE IF EXISTS "lbp_user_actions_speciales" CASCADE');
        console.log('✅ Table lbp_user_actions_speciales supprimée');

        await dataSource.query('DROP TABLE IF EXISTS "lbp_role_permissions" CASCADE');
        console.log('✅ Table lbp_role_permissions supprimée');

        await dataSource.query('DROP TABLE IF EXISTS "lbp_actions_speciales" CASCADE');
        console.log('✅ Table lbp_actions_speciales supprimée');

        await dataSource.query('DROP TABLE IF EXISTS "lbp_permissions" CASCADE');
        console.log('✅ Table lbp_permissions supprimée');

        await dataSource.query('DROP TABLE IF EXISTS "lbp_roles" CASCADE');
        console.log('✅ Table lbp_roles supprimée');

        // Supprimer les types ENUM
        await dataSource.query('DROP TYPE IF EXISTS "public"."lbp_permissions_module_enum" CASCADE');
        await dataSource.query('DROP TYPE IF EXISTS "public"."lbp_permissions_action_enum" CASCADE');
        await dataSource.query('DROP TYPE IF EXISTS "public"."lbp_actions_speciales_type_enum" CASCADE');
        console.log('✅ Types ENUM supprimés\n');

        // Ajouter les colonnes manquantes à lbp_users si elles n'existent pas
        console.log('🔧 Mise à jour de la table lbp_users...');

        try {
            await dataSource.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name='lbp_users' AND column_name='role_id') THEN
                        ALTER TABLE "lbp_users" ADD COLUMN "role_id" integer;
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name='lbp_users' AND column_name='peut_voir_toutes_agences') THEN
                        ALTER TABLE "lbp_users" ADD COLUMN "peut_voir_toutes_agences" boolean DEFAULT false;
                    END IF;
                END $$;
            `);
            console.log('✅ Table lbp_users mise à jour\n');
        } catch (error) {
            console.log('⚠️  Colonnes déjà existantes ou erreur:', error.message);
        }

        console.log('🎉 Nettoyage terminé avec succès !');
        console.log('\n📝 Prochaines étapes :');
        console.log('   1. Redémarrez le serveur backend (les tables seront recréées automatiquement)');
        console.log('   2. Exécutez: npm run seed');

        await dataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        await dataSource.destroy();
        process.exit(1);
    }
}

cleanDatabase();

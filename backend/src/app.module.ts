import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ColisModule } from './colis/colis.module';
import { FacturesModule } from './factures/factures.module';
import { PaiementsModule } from './paiements/paiements.module';
import { AuthModule } from './auth/auth.module';
import { CaisseModule } from './caisse/caisse.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RapportsModule } from './rapports/rapports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        logging: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ClientsModule,
    ColisModule,
    FacturesModule,
    PaiementsModule,
    AuthModule,
    CaisseModule,
    DashboardModule,
    RapportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

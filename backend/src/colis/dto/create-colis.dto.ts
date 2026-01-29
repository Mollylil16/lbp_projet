import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMarchandiseDto {
    @ApiProperty({ example: 'Vêtements' })
    @IsNotEmpty()
    @IsString()
    nom_marchandise: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    nbre_colis: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    nbre_articles: number;

    @ApiProperty({ example: 15.5 })
    @IsNumber()
    poids_total: number;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    prix_unit: number;

    @ApiProperty({ example: 500 })
    @IsOptional()
    @IsNumber()
    prix_emballage?: number;

    @ApiProperty({ example: 200 })
    @IsOptional()
    @IsNumber()
    prix_assurance?: number;

    @ApiProperty({ example: 1000 })
    @IsOptional()
    @IsNumber()
    prix_agence?: number;
}

export class CreateColisDto {
    @ApiProperty({ example: 'Export Maritime' })
    @IsNotEmpty()
    @IsString()
    trafic_envoi: string;

    @ApiProperty({ example: 'groupage' })
    @IsNotEmpty()
    @IsString()
    forme_envoi: string;

    @ApiProperty({ example: 'DHL', required: false })
    @IsOptional()
    @IsString()
    mode_envoi?: string;

    @ApiProperty({ example: '2024-01-29' })
    @IsDateString()
    date_envoi: string;

    @ApiProperty({ example: 1 }) // ID du client
    @IsNotEmpty()
    @IsNumber()
    id_client: number;

    @ApiProperty({ example: 'Jean Dupont' })
    @IsNotEmpty()
    @IsString()
    nom_dest: string;

    @ApiProperty({ example: 'Paris' })
    @IsString()
    @IsOptional()
    lieu_dest?: string;

    @ApiProperty({ example: '+33123456789' })
    @IsString()
    @IsOptional()
    tel_dest?: string;

    @ApiProperty({ example: 'jean@example.com' })
    @IsString()
    @IsOptional()
    email_dest?: string;

    @ApiProperty({ type: [CreateMarchandiseDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMarchandiseDto)
    marchandises: CreateMarchandiseDto[];

    @ApiProperty({ example: 'Marie Durant', required: false })
    @IsOptional()
    @IsString()
    nom_recup?: string;

    @ApiProperty({ example: 'Lyon', required: false })
    @IsOptional()
    @IsString()
    adresse_recup?: string;

    @ApiProperty({ example: '+33987654321', required: false })
    @IsOptional()
    @IsString()
    tel_recup?: string;

    @ApiProperty({ example: 'marie@example.com', required: false })
    @IsOptional()
    @IsString()
    email_recup?: string;
}

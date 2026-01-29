import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaymentMode } from '../entities/paiement.entity';

export class CreatePaiementDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    id_facture: number;

    @ApiProperty({ example: 5000 })
    @IsNotEmpty()
    @IsNumber()
    montant: number;

    @ApiProperty({ example: 0 })
    @IsOptional()
    @IsNumber()
    monnaie_rendue?: number;

    @ApiProperty({ enum: PaymentMode, example: PaymentMode.COMPTANT })
    @IsEnum(PaymentMode)
    mode_paiement: PaymentMode;

    @ApiProperty({ example: 'CHQ-123456', required: false })
    @IsOptional()
    @IsString()
    reference_paiement?: string;

    @ApiProperty({ example: '2024-01-29' })
    @IsDateString()
    date_paiement: string;
}

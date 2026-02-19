import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduitsCatalogueController } from './produits-catalogue.controller';
import { ProduitsCatalogueService } from './produits-catalogue.service';
import { ProduitCatalogue } from './entities/produit-catalogue.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProduitCatalogue])],
    controllers: [ProduitsCatalogueController],
    providers: [ProduitsCatalogueService],
    exports: [ProduitsCatalogueService],
})
export class ProduitsCatalogueModule { }

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProduitsCatalogueService } from './produits-catalogue.service';
import { CreateProduitCatalogueDto } from './dto/create-produit-catalogue.dto';
import { UpdateProduitCatalogueDto } from './dto/update-produit-catalogue.dto';
import { CategoriesProduit } from './entities/produit-catalogue.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRole } from '../auth/decorators/roles.decorator';

@Controller('produits-catalogue')
@UseGuards(JwtAuthGuard)
export class ProduitsCatalogueController {
    constructor(private readonly produitsService: ProduitsCatalogueService) { }

    @Get()
    findAll() {
        return this.produitsService.findAll();
    }

    @Get('categorie/:categorie')
    findByCategorie(@Param('categorie') categorie: CategoriesProduit) {
        return this.produitsService.findByCategorie(categorie);
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.produitsService.search(query);
    }

    @Get('historique')
    getHistorique() {
        return this.produitsService.getHistoriqueUtilisation();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.produitsService.findOne(id);
    }

    @Post()
    @UseGuards(RolesGuard)
    @RequireRole('admin', 'manager')
    create(@Body() createDto: CreateProduitCatalogueDto) {
        return this.produitsService.create(createDto);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @RequireRole('admin', 'manager')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateProduitCatalogueDto,
    ) {
        return this.produitsService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @RequireRole('admin')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.produitsService.remove(id);
    }
}

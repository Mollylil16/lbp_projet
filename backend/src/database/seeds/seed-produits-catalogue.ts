import { DataSource } from 'typeorm';
import { ProduitCatalogue, CategoriesProduit, NaturePrix } from '../../produits-catalogue/entities/produit-catalogue.entity';

export async function seedProduitsCatalogue(dataSource: DataSource) {
    const produitRepository = dataSource.getRepository(ProduitCatalogue);

    // Check if products already exist
    const count = await produitRepository.count();
    if (count > 0) {
        console.log('✅ Produits catalogue already seeded');
        return;
    }

    const produits = [
        // ========== CATÉGORIE: DENRÉE ==========
        // Prix unitaire uniquement
        { nom: 'ATTIEKE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'PLACALI', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'GARI', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'POUDRE DE CACAO', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'GOMBO', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'GNANGNAN', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'FEUILLE DE PATATE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'SOUMARA', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: "PATE D'ARACHIDE", categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'BANANE PLANTIN', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'CHIPS', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'BISSAP', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'TAMARIN', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'PATE DE GINGEMBRE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },

        // Prix unitaire ET forfaitaire (0-4 kg)
        { nom: 'POUDRE DE MIL', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 850, prix_forfaitaire: 3500, poids_min: 0, poids_max: 4 },
        { nom: 'POUDRE DE MAÏS', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_FORFAITAIRE, description: 'À partir de 5 kg', prix_forfaitaire: 3500, poids_min: 0, poids_max: 4 },
        { nom: 'POUDRE DE GOMBO', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'MIL', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'HARICOT', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'TCHONGON', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'AROME', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'GRAINE PILE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'EPICE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'MAIS', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'GNONMI', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'FONIO', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'BAOBAB', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'BONBON', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'CACAHOUETTE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'PIMENT', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'CROQUETTE', categorie: CategoriesProduit.DENREE, nature: NaturePrix.PRIX_UNITAIRE },

        // ========== CATÉGORIE: HUILE ET KARITE ==========
        { nom: 'PETIT COLAS', categorie: CategoriesProduit.HUILE_ET_KARITE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'HUILE DE COCO', categorie: CategoriesProduit.HUILE_ET_KARITE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'BEURRE DE KARITE', categorie: CategoriesProduit.HUILE_ET_KARITE, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 1000, prix_forfaitaire: 4500, poids_min: 0, poids_max: 4 },
        { nom: 'KINKELIBA', categorie: CategoriesProduit.HUILE_ET_KARITE, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'DJEKA', categorie: CategoriesProduit.HUILE_ET_KARITE, nature: NaturePrix.PRIX_UNITAIRE },

        // ========== CATÉGORIE: DIVERS ==========
        { nom: 'VETEMENTS', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 1780, prix_forfaitaire: 5000, poids_min: 0, poids_max: 2 },
        { nom: 'CHAUSSURES', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'MECHE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'DRAPS', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'OUVRAGE EN PLASTIQUE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'USTENSILES DE CUISINE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'VALISE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'ENCENS', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'SAVOIR NOIR', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'SAC A MAIN', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'ECORCE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'NEP NEP', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'INDIGO ET LIQUIDE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 2000, prix_forfaitaire: 5000, poids_min: 0, poids_max: 2 },
        { nom: 'ATTOTE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'HUILE ROUGE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'BOUILLONS', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 1500, prix_forfaitaire: 3500, poids_min: 0, poids_max: 2 },
        { nom: 'CUBE MAGGI', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'VETEMENTS DE MARQUE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 3500, prix_forfaitaire: 8500, poids_min: 0, poids_max: 2 },
        { nom: 'PAGNE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },
        { nom: 'CHAUSSURES DE MARQUE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 3500, prix_forfaitaire: 8500, poids_min: 0, poids_max: 2 },
        { nom: 'SACS DE MARQUE', categorie: CategoriesProduit.DIVERS, nature: NaturePrix.PRIX_UNITAIRE },

        // ========== CATÉGORIE: COLIS RAPIDE EXPORT ==========
        { nom: 'POISSON FUME-CREVETTE-ESCARGOT-POULET FUME', categorie: CategoriesProduit.COLIS_RAPIDE_EXPORT, nature: NaturePrix.PRIX_FORFAITAIRE, prix_unitaire: 5500, prix_forfaitaire: 7500 },
        { nom: 'COSMETIQUE', categorie: CategoriesProduit.COLIS_RAPIDE_EXPORT, nature: NaturePrix.PRIX_UNITAIRE, prix_unitaire: 5750 },
    ];

    await produitRepository.save(produits);
    console.log(`✅ ${produits.length} produits catalogue insérés avec succès`);
}

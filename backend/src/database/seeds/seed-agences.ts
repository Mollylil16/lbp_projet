import { DataSource } from 'typeorm';
import { Agence } from '../../agences/entities/agence.entity';

export async function seedAgences(dataSource: DataSource) {
    const agenceRepository = dataSource.getRepository(Agence);

    // Check if agencies already exist
    const count = await agenceRepository.count();
    if (count > 0) {
        console.log('✅ Agences already seeded');
        return;
    }

    const agences = [
        {
            code: 'CI-AEROPORT',
            nom: 'AEROPORT FELIX HOUPHOUET BOIGNY ZONE FRET',
            pays: "Côte d'Ivoire",
            ville: 'Abidjan',
            adresse: 'Zone Fret Aéroport FHB',
            telephone: '0500200376',
            email: 'aeroport@lbp-ci.com',
            nom_responsable: 'Adepo Marie-Estelle',
            tel_responsable: '+225 0508003635',
            devise: 'XOF',
            actif: true,
        },
        {
            code: 'CI-ADJAME',
            nom: 'ADJAME RENAULT NON LOIN DE LA PHARMACIE LATIN',
            pays: "Côte d'Ivoire",
            ville: 'Abidjan Adjamé',
            adresse: 'Adjamé Renault, près Pharmacie Latin',
            telephone: '0500200474',
            email: 'adjame@lbp-ci.com',
            nom_responsable: 'Akoiblin Roxanne',
            tel_responsable: '+225 0508003635',
            devise: 'XOF',
            actif: true,
        },
        {
            code: 'CI-ABOBO',
            nom: 'LBP COTE D\'IVOIRE ABOBO',
            pays: "Côte d'Ivoire",
            ville: 'Abidjan Abobo',
            adresse: 'Abobo',
            telephone: undefined,
            email: undefined,
            nom_responsable: undefined,
            tel_responsable: undefined,
            devise: 'XOF',
            actif: true,
        },
        {
            code: 'DG',
            nom: 'DIRECTION GENERALE',
            pays: "Côte d'Ivoire",
            ville: 'ABIDJAN',
            adresse: 'Abidjan',
            telephone: '2721580978',
            email: 'direction@lbp-ci.com',
            nom_responsable: undefined,
            tel_responsable: undefined,
            devise: 'XOF',
            actif: true,
        },
        {
            code: 'FR-PARIS',
            nom: 'STT-INTER FRANCE',
            pays: 'FRANCE',
            ville: 'PARIS',
            adresse: 'PARIS 17 CHEMIN DES VIGNES 93000 BOBIGNY',
            telephone: '+33775732797',
            email: 'ospfrance@stt-inter.com',
            nom_responsable: 'KADJO',
            tel_responsable: '+33 751 1983 82',
            devise: 'EUR',
            actif: true,
        },
        {
            code: 'SN-DAKAR',
            nom: 'STT-INTER SENEGAL',
            pays: 'SENEGAL',
            ville: 'DAKAR',
            adresse: 'DAKAR PARCELLES ASSAINIES',
            telephone: undefined,
            email: 'senegal@stt-inter.com',
            nom_responsable: undefined,
            tel_responsable: undefined,
            devise: 'XOF',
            actif: true,
        },
    ];

    await agenceRepository.save(agences);
    console.log(`✅ ${agences.length} agences insérées avec succès`);
}

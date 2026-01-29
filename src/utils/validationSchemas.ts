/**
 * Schémas de validation Zod prêts à l'emploi pour les formulaires LBP
 */

import { z } from 'zod'
import {
  phoneSchema,
  emailSchema,
  nameSchema,
  montantPositifSchema,
  dateSchema,
  numPieceSchema,
  poidsSchema,
  quantiteSchema,
  texteLongSchema,
  adresseSchema,
} from './validation'

/**
 * Schéma pour un client expéditeur
 */
export const clientExpSchema = z.object({
  nom_exp: nameSchema,
  type_piece_exp: z.string().min(1, 'Le type de pièce est obligatoire'),
  num_piece_exp: numPieceSchema,
  tel_exp: phoneSchema,
  email_exp: emailSchema,
  adresse_exp: adresseSchema.optional(),
})

/**
 * Schéma pour une ligne de marchandise
 */
export const marchandiseSchema = z.object({
  nom_marchandise: z.string().min(1, 'Le nom de la marchandise est obligatoire'),
  nbre_colis: quantiteSchema,
  nbre_articles: quantiteSchema,
  poids_total: poidsSchema,
  prix_unit: montantPositifSchema,
  prix_emballage: z.number().min(0).optional().default(0),
  prix_assurance: z.number().min(0).optional().default(0),
  prix_agence: z.number().min(0).optional().default(0),
})

/**
 * Schéma pour un destinataire
 */
export const destinataireSchema = z.object({
  nom_destinataire: nameSchema,
  lieu_dest: adresseSchema,
  tel_dest: phoneSchema,
  email_dest: emailSchema,
})

/**
 * Schéma pour un récupérateur (optionnel)
 */
export const recuperateurSchema = z.object({
  nom_recup: nameSchema.optional(),
  adresse_recup: adresseSchema.optional(),
  tel_recup: phoneSchema.optional(),
  email_recup: emailSchema,
}).optional()

/**
 * Schéma pour un mouvement de caisse (approvisionnement)
 */
export const approSchema = z.object({
  date: dateSchema,
  libelle: texteLongSchema,
  montant: montantPositifSchema,
  id_caisse: z.number().min(1, 'La caisse est obligatoire'),
})

/**
 * Schéma pour un décaissement
 */
export const decaissementSchema = z.object({
  date: dateSchema,
  libelle: texteLongSchema,
  montant: montantPositifSchema,
  numero_dossier: z.string().min(1, 'Le numéro de dossier est obligatoire'),
  nom_demandeur: nameSchema,
  id_caisse: z.number().min(1, 'La caisse est obligatoire'),
})

/**
 * Schéma pour une entrée de caisse
 */
export const entreeCaisseSchema = z.object({
  date: dateSchema,
  mode_reglement: z.enum(['ESPECE', 'CHEQUE', 'VIREMENT'], {
    errorMap: () => ({ message: 'Le mode de règlement est obligatoire' }),
  }),
  numero_dossier: z.string().min(1, 'Le numéro de dossier est obligatoire'),
  nom_client: nameSchema,
  montant: montantPositifSchema,
  reste_a_payer: z.number().min(0).optional().default(0),
  // Champs conditionnels selon le mode de règlement
  numero_cheque: z.string().optional(),
  banque_remise: z.string().optional(),
  numero_recu: z.string().optional(),
  numero_virement: z.string().optional(),
  banque_creditee: z.string().optional(),
  id_caisse: z.number().min(1, 'La caisse est obligatoire'),
}).refine(
  (data) => {
    // Si chèque, numéro et banque requis
    if (data.mode_reglement === 'CHEQUE') {
      return !!data.numero_cheque && !!data.banque_remise
    }
    // Si espèce, numéro de reçu requis
    if (data.mode_reglement === 'ESPECE') {
      return !!data.numero_recu
    }
    // Si virement, numéro et banque requis
    if (data.mode_reglement === 'VIREMENT') {
      return !!data.numero_virement && !!data.banque_creditee
    }
    return true
  },
  {
    message: 'Les champs requis pour le mode de règlement sélectionné doivent être remplis',
  }
)

/**
 * Schéma pour un client
 */
export const clientSchema = z.object({
  nom: nameSchema,
  type_client: z.string().min(1, 'Le type de client est obligatoire'),
  telephone: phoneSchema,
  email: emailSchema,
  adresse: adresseSchema.optional(),
  type_piece: z.string().optional(),
  num_piece: numPieceSchema.optional(),
})

/**
 * Schéma pour un paiement
 */
export const paiementSchema = z.object({
  id_facture: z.number().min(1, 'La facture est obligatoire'),
  montant: montantPositifSchema,
  date_paiement: dateSchema,
  mode_paiement: z.enum(['ESPECE', 'CHEQUE', 'VIREMENT'], {
    errorMap: () => ({ message: 'Le mode de paiement est obligatoire' }),
  }),
  numero_cheque: z.string().optional(),
  banque: z.string().optional(),
  numero_virement: z.string().optional(),
  reference: z.string().optional(),
})

/**
 * Constantes pour la gestion des factures LBP
 * Configuration des images en-tête et pied de page
 */

/**
 * Chemins des images de facture
 * Ces chemins doivent être accessibles depuis le dossier public/images
 */
export const FACTURE_IMAGES = {
  /**
   * Image en-tête de facture
   * Chemin relatif depuis /public/images
   */
  HEADER: '/images/entete_lbp.png',

  /**
   * Image pied de page de facture
   * Chemin relatif depuis /public/images
   */
  FOOTER: '/images/footer_lbp.png',
} as const

/**
 * Configuration du template de facture
 */
export const FACTURE_CONFIG = {
  /**
   * Taille de l'en-tête en pixels (hauteur)
   * À ajuster selon les dimensions réelles de l'image
   */
  HEADER_HEIGHT: 150,

  /**
   * Taille du pied de page en pixels (hauteur)
   * À ajuster selon les dimensions réelles de l'image
   */
  FOOTER_HEIGHT: 100,

  /**
   * Marge en pixels autour du contenu
   */
  MARGIN: {
    top: 20,
    right: 40,
    bottom: 100, // Plus grand pour laisser place au footer
    left: 40,
  },

  /**
   * Format de la facture (pour PDF)
   */
  FORMAT: 'A4' as const,

  /**
   * Orientation
   */
  ORIENTATION: 'portrait' as const,
} as const

/**
 * Messages et textes pour les factures
 */
export const FACTURE_LABELS = {
  PROFORMA: 'FACTURE PROFORMA',
  DEFINITIVE: 'FACTURE DÉFINITIVE',
  NUM_FACTURE: 'N° Facture',
  DATE: 'Date',
  REF_COLIS: 'Référence Colis',
  EXPEDITEUR: 'Expéditeur',
  DESTINATAIRE: 'Destinataire',
  DESCRIPTION: 'Description',
  QUANTITE: 'Quantité',
  PRIX_UNITAIRE: 'Prix unitaire',
  MONTANT_HT: 'Montant HT',
  TVA: 'TVA',
  MONTANT_TTC: 'Montant TTC',
  CONDITIONS: 'Conditions de paiement',
  VALIDITE: 'Validité',
} as const

/**
 * CONSTANTES DE L'APPLICATION LBP
 * 
 * Configuration globale de l'application
 */

export const APP_CONFIG = {
  name: 'LBP',
  fullName: 'LA BELLE PORTE',
  description: 'Gestion de Colis',
  version: '1.0.0',

  // Informations entreprise (sera configurable via admin)
  company: {
    name: 'LA BELLE PORTE',
    shortName: 'LBP',
    address: '', // À configurer
    phone: '', // À configurer
    email: '', // À configurer
    website: '', // À configurer
    rccm: '', // À configurer
    nif: '', // À configurer
    accountNumber: '', // À configurer
  },

  // Options trafic d'envoi
  traficEnvoi: [
    'Import Aérien',
    'Import Maritime',
    'Export Aérien',
    'Export Maritime',
    'Colis France -> CI',
    'Colis Sénégal -> CI',
    'Colis CI -> France',
    'Colis CI -> Sénégal',
  ] as const,

  // Modes d'envoi
  modeEnvoi: [
    'DHL',
    'Colis Rapides Export',
    'Colis Rapides Import',
    'Autres',
    'groupage',
  ] as const,

  // Types de pièce d'identité
  typesPieceIdentite: [
    'Carte Nationale Identite',
    'Passeport',
    'Certificat de Nationalite',
    'Carte de Sejour',
    'Carte de Resident',
    'Permis de Conduire',
  ] as const,

  // Modes de paiement
  modesPaiement: [
    { value: 0, label: 'Comptant' },
    { value: 30, label: '30 jours' },
    { value: 45, label: '45 jours' },
    { value: 60, label: '60 jours' },
    { value: 90, label: '90 jours' },
  ] as const,

  // Devise
  devise: 'FCFA',

  // Formats de date
  dateFormat: 'DD/MM/YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',

  // Pagination par défaut
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: ['10', '20', '50', '100'],
  },

  // Refresh automatique (en millisecondes)
  refresh: {
    dashboard: 180000, // 3 minutes
    widgets: 30000, // 30 secondes
  },
} as const

export type TraficEnvoi = typeof APP_CONFIG.traficEnvoi[number]
export type ModeEnvoi = typeof APP_CONFIG.modeEnvoi[number]
export type TypePieceIdentite = typeof APP_CONFIG.typesPieceIdentite[number]

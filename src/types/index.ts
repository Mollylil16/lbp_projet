// Types utilisateurs et authentification
export interface User {
  id: number
  code_user: string
  username: string
  full_name: string
  email?: string
  phone?: string
  role: Role
  agency?: Agency
  agency_id?: number // ID agence (pour filtrage CODEACCES 9)
  filter_mode?: 'individual' | 'agency' | 'all' // Mode de filtrage (CODEACCES 8, 9, 14)
  can_delete?: boolean // Protection suppression (CODEACCES 5)
  can_modify?: boolean // Protection modification (CODEACCES 6)
  status: 'active' | 'inactive' | 'suspended'
  last_login?: string
  created_at: string
}

export interface Role {
  id: number
  code: string
  name: string
  description?: string
}

export interface Agency {
  id: number
  code: string
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface AuthResponse {
  user: User
  token: string
  refresh_token?: string
  permissions: string[]
}

export interface LoginCredentials {
  username: string
  password: string
}

// Types permissions
export interface Permission {
  id: number
  code: string
  name: string
  module: string
  action: string
  description?: string
}

// Types Colis
export interface Colis {
  id: number
  ref_colis: string
  mode_envoi: string
  date_envoi: string
  nom_marchandise: string
  nbre_colis: number
  nbre_articles: number
  poids_total: number
  prix_unit: number
  prix_emballage: number
  prix_assurance: number
  prix_agence: number
  total_montant: number
  client_colis: ClientColis
  nom_destinataire: string
  lieu_dest: string
  tel_dest: string
  email_dest?: string
  adresse_recup?: string
  nom_recup?: string
  tel_recup?: string
  email_recup?: string
  forme_envoi: 'groupage' | 'autres_envoi'
  trafic_envoi: 'Import Aérien' | 'Import Maritime' | 'Export Aérien' | 'Export Maritime'
  code_user: string
  agence?: Agency
  date_enrg: string
}

export interface ClientColis {
  id: number
  nom_exp: string
  type_piece_exp: string
  num_piece_exp: string
  tel_exp: string
  email_exp?: string
  date_enrg: string
}

// Types Factures
export interface FactureColis {
  id: number
  num_fact_colis: string
  total_mont_ttc: number
  id_colis: number
  ref_colis: string
  code_user: string
  etat: 0 | 1 // 0 = non validée, 1 = validée
  date_fact: string
}

// Types Paiements
export interface Paiement {
  id: number
  montant: number
  date_paiement: string
  mode_paiement: string
  reference: string
  facture_id?: number
  colis_id?: number
  code_user: string
}

// Types Dashboard
export interface DashboardStats {
  colis_aujourdhui: number
  colis_en_transit: number
  colis_livres: number
  revenus_jour: number
  revenus_mois: number
  clients_actifs: number
  factures_a_valider: number
  paiements_attente: number
}

export interface PointCaisse {
  entrees: number
  sorties: number
  solde: number
  date: string
}

// Types Caisse
export type TypeMouvementCaisse = 
  | 'APPRO' 
  | 'DECAISSEMENT' 
  | 'ENTREE_CHEQUE' 
  | 'ENTREE_ESPECE' 
  | 'ENTREE_VIREMENT'

export type ModeReglement = 'ESPECE' | 'CHEQUE' | 'VIREMENT'

export interface MouvementCaisse {
  id?: number
  date: string
  type: TypeMouvementCaisse
  libelle: string
  montant: number
  solde?: number // Solde après l'opération
  mode_reglement?: ModeReglement
  numero_dossier?: string // RefColis
  numero_cheque?: string
  numero_virement?: string
  numero_recu?: string
  numero_fiche_recette?: string
  numero_bordereau_versement?: string
  numero_ordre_decaissement?: string
  nom_client?: string
  nom_demandeur?: string
  banque_remise?: string
  banque_creditee?: string
  reste_a_payer?: number
  id_colis?: number
  id_caisse: number
  code_user?: string
  etat?: number // 0 = Brouillon, 1 = Validé
  created_at?: string
  updated_at?: string
}

export interface Caisse {
  id: number
  code: string
  libelle: string
  montant_initial: number
  solde_actuel: number
  autorise: boolean
  id_agence?: number
  code_user?: string
  created_at?: string
  updated_at?: string
}

export interface RapportGrandesLignes {
  date_debut: string
  date_fin: string
  total_appro: number
  total_decaissement: number
  total_entrees_cheque: number
  total_entrees_espece: number
  total_entrees_virement: number
  total_entrees: number
  solde_initial: number
  solde_final: number
}

// Types généraux
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// DTOs pour création et mise à jour de colis
export interface CreateColisDto {
  trafic_envoi: string
  date_envoi: string
  mode_envoi: string
  forme_envoi: 'groupage' | 'autres_envoi'
  
  // Informations expéditeur
  client_colis: {
    nom_exp: string
    type_piece_exp: string
    num_piece_exp: string
    tel_exp: string
    email_exp?: string
  }
  
  // Informations marchandise (tableau pour plusieurs colis)
  marchandise: Array<{
    nom_marchandise: string
    nbre_colis: number
    nbre_articles: number
    poids_total: number
    prix_unit: number
    prix_emballage?: number
    prix_assurance?: number
    prix_agence?: number
  }>
  
  // Informations destinataire
  nom_destinataire: string
  lieu_dest: string
  tel_dest: string
  email_dest?: string
  
  // Informations récupérateur (optionnel)
  nom_recup?: string
  adresse_recup?: string
  tel_recup?: string
  email_recup?: string
}

export interface UpdateColisDto extends Partial<CreateColisDto> {
  id?: number
}
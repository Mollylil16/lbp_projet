/**
 * Utilitaires de calculs (factures, paiements)
 */

/**
 * Calcule le total d'une ligne marchandise
 */
export function calculerTotalLigneMarchandise(
  prixUnit: number,
  nbreColis: number,
  prixEmballage: number = 0,
  prixAssurance: number = 0,
  prixAgence: number = 0
): number {
  const totalUnitaire = prixUnit * nbreColis
  return totalUnitaire + prixEmballage + prixAssurance + prixAgence
}

/**
 * Calcule le total d'un tableau de marchandises
 */
export function calculerTotalMarchandises(
  marchandises: Array<{
    prix_unit: number
    nbre_colis: number
    prix_emballage?: number
    prix_assurance?: number
    prix_agence?: number
  }>
): number {
  return marchandises.reduce((total, marchandise) => {
    return (
      total +
      calculerTotalLigneMarchandise(
        marchandise.prix_unit,
        marchandise.nbre_colis,
        marchandise.prix_emballage || 0,
        marchandise.prix_assurance || 0,
        marchandise.prix_agence || 0
      )
    )
  }, 0)
}

/**
 * Calcule la TVA sur un montant HT
 */
export function calculerTVA(montantHT: number, tauxTVA: number = 0): number {
  return montantHT * (tauxTVA / 100)
}

/**
 * Calcule le montant TTC à partir du HT et de la TVA
 */
export function calculerTTC(montantHT: number, tauxTVA: number = 0): number {
  return montantHT + calculerTVA(montantHT, tauxTVA)
}

/**
 * Calcule le montant restant à payer
 */
export function calculerRestantAPayer(montantTotal: number, montantPaye: number): number {
  const restant = montantTotal - montantPaye
  return restant > 0 ? restant : 0
}

/**
 * Calcule la monnaie rendue pour un paiement comptant
 */
export function calculerMonnaieRendue(montantDu: number, montantRecu: number): number {
  const monnaie = montantRecu - montantDu
  return monnaie > 0 ? monnaie : 0
}

/**
 * Arrondit un montant (au supérieur si nécessaire)
 */
export function arrondirMontant(montant: number, decimales: number = 0): number {
  return Math.round(montant * Math.pow(10, decimales)) / Math.pow(10, decimales)
}

/**
 * Vérifie si un paiement est complet
 */
export function isPaiementComplet(montantTotal: number, montantPaye: number, tolerance: number = 0.01): boolean {
  return montantPaye >= montantTotal - tolerance
}

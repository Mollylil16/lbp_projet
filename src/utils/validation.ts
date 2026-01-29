/**
 * Schémas de validation Zod réutilisables
 * Messages d'erreur en français
 */

import { z } from 'zod'

/**
 * Messages d'erreur personnalisés en français
 */
const frenchErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let message: string

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        message = 'Ce champ est obligatoire'
      } else {
        message = `Type invalide. Attendu: ${issue.expected}, reçu: ${issue.received}`
      }
      break

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        message = 'Adresse email invalide'
      } else if (issue.validation === 'url') {
        message = 'URL invalide'
      } else {
        message = 'Format de chaîne invalide'
      }
      break

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        message = `Le champ doit contenir au moins ${issue.minimum} caractère${issue.minimum > 1 ? 's' : ''}`
      } else if (issue.type === 'number') {
        message = `La valeur doit être supérieure ou égale à ${issue.minimum}`
      } else if (issue.type === 'array') {
        message = `Au moins ${issue.minimum} élément${issue.minimum > 1 ? 's' : ''} requis`
      } else {
        message = 'Valeur trop petite'
      }
      break

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        message = `Le champ ne doit pas dépasser ${issue.maximum} caractères`
      } else if (issue.type === 'number') {
        message = `La valeur doit être inférieure ou égale à ${issue.maximum}`
      } else if (issue.type === 'array') {
        message = `Maximum ${issue.maximum} élément${issue.maximum > 1 ? 's' : ''} autorisé${issue.maximum > 1 ? 's' : ''}`
      } else {
        message = 'Valeur trop grande'
      }
      break

    case z.ZodIssueCode.invalid_date:
      message = 'Date invalide'
      break

    case z.ZodIssueCode.custom:
      message = issue.message || 'Validation échouée'
      break

    default:
      message = ctx.defaultError
  }

  return { message }
}

// Configurer Zod pour utiliser les messages français
z.setErrorMap(frenchErrorMap)

/**
 * Schémas de validation réutilisables
 */

// Validation téléphone (Côte d'Ivoire)
export const phoneSchema = z
  .string()
  .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
  .regex(/^(\+225|225|0)?[0-9]{10}$/, 'Format de téléphone invalide (ex: +225 XX XX XX XX XX)')

// Validation email
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .optional()
  .or(z.literal(''))

// Validation nom (personne)
export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne doit pas dépasser 100 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')

// Validation montant (positif)
export const montantSchema = z
  .number()
  .min(0, 'Le montant doit être positif')
  .or(z.string().transform((val) => {
    const num = parseFloat(val.replace(/\s/g, ''))
    if (isNaN(num)) throw new Error('Montant invalide')
    return num
  }))

// Validation montant strictement positif
export const montantPositifSchema = z
  .number()
  .min(0.01, 'Le montant doit être supérieur à 0')
  .or(z.string().transform((val) => {
    const num = parseFloat(val.replace(/\s/g, ''))
    if (isNaN(num) || num <= 0) throw new Error('Le montant doit être supérieur à 0')
    return num
  }))

// Validation date
export const dateSchema = z
  .string()
  .min(1, 'La date est obligatoire')
  .or(z.date())

// Validation référence colis (format: LBP-YYYY-XXX)
export const refColisSchema = z
  .string()
  .min(1, 'La référence est obligatoire')
  .regex(/^LBP-\d{4}-\d{3,}$/, 'Format de référence invalide (ex: LBP-2024-001)')

// Validation numéro de pièce d'identité
export const numPieceSchema = z
  .string()
  .min(6, 'Le numéro de pièce doit contenir au moins 6 caractères')
  .max(50, 'Le numéro de pièce ne doit pas dépasser 50 caractères')

// Validation poids
export const poidsSchema = z
  .number()
  .min(0.01, 'Le poids doit être supérieur à 0')
  .max(100000, 'Le poids ne peut pas dépasser 100 000 kg')

// Validation quantité
export const quantiteSchema = z
  .number()
  .int('La quantité doit être un nombre entier')
  .min(1, 'La quantité doit être au moins 1')

// Validation texte long (description, libellé)
export const texteLongSchema = z
  .string()
  .min(3, 'Le texte doit contenir au moins 3 caractères')
  .max(500, 'Le texte ne doit pas dépasser 500 caractères')
  .optional()

// Validation adresse
export const adresseSchema = z
  .string()
  .min(5, 'L\'adresse doit contenir au moins 5 caractères')
  .max(200, 'L\'adresse ne doit pas dépasser 200 caractères')

/**
 * Fonction helper pour créer un schéma avec message personnalisé
 */
export function createCustomSchema<T extends z.ZodTypeAny>(
  schema: T,
  customMessage: string
): z.ZodEffects<T> {
  return schema.refine(() => true, {
    message: customMessage,
  })
}

/**
 * Validation de formulaire avec gestion d'erreurs améliorée
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })

      return { success: false, errors }
    }
    
    return {
      success: false,
      errors: { _general: 'Une erreur de validation est survenue' },
    }
  }
}

/**
 * Obtenir le premier message d'erreur d'un champ
 */
export function getFieldError(
  errors: Record<string, string> | undefined,
  fieldPath: string
): string | undefined {
  if (!errors) return undefined
  
  // Chercher l'erreur exacte
  if (errors[fieldPath]) {
    return errors[fieldPath]
  }
  
  // Chercher les erreurs imbriquées (ex: client_colis.nom_exp)
  const keys = Object.keys(errors)
  const matchingKey = keys.find((key) => key.startsWith(fieldPath + '.'))
  
  return matchingKey ? errors[matchingKey] : undefined
}

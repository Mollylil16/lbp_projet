# 📝 Guide d'utilisation de la validation des formulaires

## Vue d'ensemble

Le système de validation utilise **Zod** pour la validation de schémas et **React Hook Form** pour la gestion des formulaires. Il inclut :

- ✅ Validation en temps réel
- ✅ Messages d'erreur en français
- ✅ Sauvegarde automatique des brouillons
- ✅ Composants réutilisables

## 🚀 Utilisation rapide

### 1. Utiliser un schéma existant

```tsx
import { useFormValidation } from '@hooks/useFormValidation'
import { approSchema } from '@utils/validationSchemas'
import { FormAutoSaveIndicator } from '@components/common/FormAutoSaveIndicator'
import { FormFieldError } from '@components/common/FormFieldError'

const MyForm = () => {
  const { form, handleSubmit, isSubmitting, hasUnsavedChanges } = useFormValidation({
    schema: approSchema,
    autoSaveKey: 'appro-form', // Optionnel : sauvegarde automatique
    onSubmit: async (data) => {
      // Traiter les données validées
      await createAppro(data)
    },
    onError: (errors) => {
      // Gérer les erreurs de validation
      console.log('Erreurs:', errors)
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <FormAutoSaveIndicator hasUnsavedChanges={hasUnsavedChanges} />
      
      <Form.Item
        label="Montant"
        validateStatus={form.formState.errors.montant ? 'error' : ''}
        help={<FormFieldError 
          error={form.formState.errors.montant?.message} 
          touched={form.formState.touchedFields.montant} 
        />}
      >
        <InputNumber
          {...form.register('montant', { valueAsNumber: true })}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isSubmitting}>
        Enregistrer
      </Button>
    </form>
  )
}
```

### 2. Créer un schéma personnalisé

```tsx
import { z } from 'zod'
import { nameSchema, phoneSchema, emailSchema } from '@utils/validation'

const myCustomSchema = z.object({
  nom: nameSchema,
  telephone: phoneSchema,
  email: emailSchema,
  age: z.number().min(18, 'Vous devez avoir au moins 18 ans'),
})
```

## 📚 Schémas disponibles

### Schémas de base (dans `validation.ts`)
- `phoneSchema` - Téléphone Côte d'Ivoire
- `emailSchema` - Email optionnel
- `nameSchema` - Nom de personne
- `montantSchema` - Montant positif ou nul
- `montantPositifSchema` - Montant strictement positif
- `dateSchema` - Date
- `refColisSchema` - Référence colis (LBP-YYYY-XXX)
- `numPieceSchema` - Numéro de pièce d'identité
- `poidsSchema` - Poids (0.01 à 100000 kg)
- `quantiteSchema` - Quantité entière positive
- `texteLongSchema` - Texte long optionnel
- `adresseSchema` - Adresse

### Schémas complets (dans `validationSchemas.ts`)
- `clientExpSchema` - Client expéditeur
- `marchandiseSchema` - Ligne de marchandise
- `destinataireSchema` - Destinataire
- `recuperateurSchema` - Récupérateur (optionnel)
- `approSchema` - Approvisionnement caisse
- `decaissementSchema` - Décaissement
- `entreeCaisseSchema` - Entrée de caisse
- `clientSchema` - Client
- `paiementSchema` - Paiement

## 🎯 Fonctionnalités

### Sauvegarde automatique

La sauvegarde automatique est activée en passant `autoSaveKey` :

```tsx
const { form, hasUnsavedChanges, clearDraft, loadDraft } = useFormValidation({
  schema: mySchema,
  autoSaveKey: 'my-form-unique-key', // Active la sauvegarde
  onSubmit: handleSubmit,
})
```

- **Sauvegarde** : Automatique après 2 secondes d'inactivité
- **Chargement** : Automatique au montage du composant
- **Nettoyage** : Automatique après soumission réussie

### Validation en temps réel

La validation se fait automatiquement à chaque changement (`mode: 'onChange'`).

### Messages d'erreur

Les messages sont automatiquement en français grâce à la configuration Zod.

## 🔧 Exemple complet

```tsx
import React from 'react'
import { Form, Input, InputNumber, DatePicker, Button } from 'antd'
import { useFormValidation } from '@hooks/useFormValidation'
import { approSchema } from '@utils/validationSchemas'
import { FormAutoSaveIndicator } from '@components/common/FormAutoSaveIndicator'
import { FormFieldError } from '@components/common/FormFieldError'
import { Controller } from 'react-hook-form'
import dayjs from 'dayjs'

export const ApproFormExample = () => {
  const { form, handleSubmit, isSubmitting, hasUnsavedChanges } = useFormValidation({
    schema: approSchema,
    autoSaveKey: 'appro-form',
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      montant: 0,
    },
    onSubmit: async (data) => {
      await createAppro(data)
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <FormAutoSaveIndicator hasUnsavedChanges={hasUnsavedChanges} />

      <Form.Item
        label="Date"
        validateStatus={form.formState.errors.date ? 'error' : ''}
        help={
          <FormFieldError
            error={form.formState.errors.date?.message}
            touched={form.formState.touchedFields.date}
          />
        }
      >
        <Controller
          name="date"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              {...field}
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) => field.onChange(date?.format('YYYY-MM-DD'))}
              style={{ width: '100%' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Montant"
        validateStatus={form.formState.errors.montant ? 'error' : ''}
        help={
          <FormFieldError
            error={form.formState.errors.montant?.message}
            touched={form.formState.touchedFields.montant}
          />
        }
      >
        <Controller
          name="montant"
          control={form.control}
          render={({ field }) => (
            <InputNumber
              {...field}
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            />
          )}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isSubmitting}>
        Enregistrer
      </Button>
    </form>
  )
}
```

## 📝 Notes importantes

1. **Types TypeScript** : Les schémas Zod génèrent automatiquement les types TypeScript
2. **Validation serveur** : Toujours valider aussi côté serveur
3. **Performance** : La validation en temps réel peut être désactivée si nécessaire
4. **Brouillons** : Les brouillons expirent après 7 jours

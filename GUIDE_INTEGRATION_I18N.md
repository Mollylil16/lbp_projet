# Guide d'Intégration i18n dans les Composants

## 1. Utilisation du Hook `useTranslation`

```tsx
import { useTranslation } from '@hooks/useTranslation'

function MyComponent() {
  const { t } = useTranslation()
  
  // Traduction simple
  return <div>{t('common.save')}</div>
  
  // Traduction avec namespace
  const { t } = useTranslation('colis')
  return <div>{t('title')}</div>
  
  // Traduction avec interpolation
  return <div>{t('colis.totalColis', { total: 10 })}</div>
}
```

## 2. Structure des fichiers de traduction

Les traductions sont organisées par namespace :
- `common` : Actions et textes communs
- `auth` : Authentification
- `navigation` : Navigation
- `colis` : Module Colis
- `caisse` : Module Caisse
- `errors` : Messages d'erreur
- `validation` : Messages de validation
- `format` : Formats de date/devise

## 3. Bonnes Pratiques

### ✅ À FAIRE
- Utiliser les clés de traduction pour tous les textes visibles
- Grouper les traductions par namespace
- Utiliser l'interpolation pour les valeurs dynamiques
- Vérifier que toutes les clés existent en FR et EN

### ❌ À ÉVITER
- Textes en dur dans les composants
- Traductions directement dans le code
- Oublier de mettre à jour les deux fichiers (fr.json et en.json)

## 4. Exemple d'Intégration Complète

```tsx
import { useTranslation } from '@hooks/useTranslation'
import { Button, Input, Select } from 'antd'

function ColisForm() {
  const { t } = useTranslation('colis')
  
  return (
    <>
      <Input 
        placeholder={t('nomComplet')}
        label={t('nomExpediteur')}
      />
      <Button>{t('common.save')}</Button>
    </>
  )
}
```

## 5. Commandes Utiles

- Vérifier les traductions manquantes : `npm run i18n:check`
- Extraire les clés du code : `npm run i18n:extract`
- Linter les traductions : `npm run i18n:lint`

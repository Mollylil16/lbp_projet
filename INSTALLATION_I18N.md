# 🌐 Installation de l'Internationalisation (i18n)

## 📦 Installation des dépendances

Avant d'utiliser l'i18n, vous devez installer les packages nécessaires :

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

## 🚀 Configuration

### 1. Initialiser i18n dans `main.tsx`

```tsx
import './i18n' // Import de la configuration i18n
```

### 2. Utiliser les traductions dans vos composants

```tsx
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  )
}
```

### 3. Ajouter le sélecteur de langue dans le header

```tsx
import { LanguageSelector } from '@components/common/LanguageSelector'

// Dans MainLayout.tsx
<LanguageSelector />
```

## 📝 Structure des traductions

Les fichiers de traduction sont dans `src/i18n/locales/` :
- `fr.json` - Français (par défaut)
- `en.json` - Anglais

### Format JSON

```json
{
  "namespace": {
    "key": "Traduction",
    "keyWithVariable": "Traduction avec {{variable}}"
  }
}
```

## 🔧 Utilisation

### Traduction simple

```tsx
const { t } = useTranslation()
<p>{t('common.loading')}</p>
```

### Traduction avec variables

```tsx
const { t } = useTranslation()
<p>{t('validation.minLength', { min: 10 })}</p>
```

### Changer la langue programmatiquement

```tsx
const { i18n } = useTranslation()
i18n.changeLanguage('en')
```

### Formater dates/devises selon la langue

```tsx
import { formatDateLocalized, formatMontantWithDeviseLocalized } from '@utils/formatI18n'
import { useTranslation } from 'react-i18next'

const { i18n } = useTranslation()
const formattedDate = formatDateLocalized(date, i18n.language)
const formattedAmount = formatMontantWithDeviseLocalized(amount, i18n.language)
```

## 📋 Prochaines étapes

1. ✅ Installer les packages (voir commande ci-dessus)
2. ✅ Importer `./i18n` dans `main.tsx`
3. ✅ Ajouter `LanguageSelector` dans le header
4. ⚠️ Remplacer les chaînes hardcodées par `t('key')` dans les composants
5. ⚠️ Ajouter les traductions manquantes dans `fr.json` et `en.json`

## 🎯 Composants à traduire

Priorité haute :
- LoginPage
- DashboardPage
- ColisList
- FacturesListPage
- MainLayout (menu)
- SidebarMenu

Priorité moyenne :
- Tous les formulaires
- Messages d'erreur
- Notifications toast
- Modals

Priorité basse :
- Tooltips
- Placeholders
- Messages de validation

---

**Note** : Les fichiers i18n sont créés, mais les packages doivent être installés et l'intégration dans les composants doit être faite progressivement.

# 🚀 Exemple d'utilisation des états optimistes

## Vue d'ensemble

Les états optimistes permettent de mettre à jour l'UI **immédiatement** avant la confirmation du serveur, puis de faire un **rollback automatique** en cas d'erreur.

## Exemple 1 : Suppression optimiste simple

```tsx
import { useOptimisticDelete } from '@hooks/useOptimisticActions'
import { OptimisticButton } from '@components/common/OptimisticButton'
import { colisService } from '@services/colis.service'

const ColisList = () => {
  const queryKey = ['colis', 'groupage']
  
  const deleteMutation = useOptimisticDelete(
    queryKey,
    (id) => colisService.deleteColis(id),
    (colis) => colis.id,
    {
      successMessage: 'Colis supprimé avec succès',
      errorMessage: 'Erreur lors de la suppression du colis',
    }
  )

  return (
    <OptimisticButton
      danger
      onClick={() => deleteMutation.mutate(colis.id)}
      isOptimistic={deleteMutation.isPending}
      optimisticLabel="Suppression..."
    >
      Supprimer
    </OptimisticButton>
  )
}
```

## Exemple 2 : Création optimiste

```tsx
import { useOptimisticCreate } from '@hooks/useOptimisticActions'
import { colisService } from '@services/colis.service'

const CreateColisForm = () => {
  const queryKey = ['colis', 'groupage']
  
  const createMutation = useOptimisticCreate(
    queryKey,
    (data) => colisService.createColis(data),
    {
      successMessage: 'Colis créé avec succès',
      onSuccess: (newColis) => {
        // Rediriger ou fermer le modal
        console.log('Nouveau colis créé:', newColis)
      },
    }
  )

  const handleSubmit = (data) => {
    createMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
      <button
        type="submit"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Création...' : 'Créer'}
      </button>
    </form>
  )
}
```

## Exemple 3 : Mise à jour optimiste

```tsx
import { useOptimisticUpdate } from '@hooks/useOptimisticActions'
import { colisService } from '@services/colis.service'

const EditColisForm = ({ colis }) => {
  const queryKey = ['colis', 'groupage']
  
  const updateMutation = useOptimisticUpdate(
    queryKey,
    (id, data) => colisService.updateColis(id, data),
    (colis) => colis.id,
    {
      successMessage: 'Colis modifié avec succès',
    }
  )

  const handleSubmit = (data) => {
    updateMutation.mutate({
      id: colis.id,
      data,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
      <button
        type="submit"
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Modification...' : 'Modifier'}
      </button>
    </form>
  )
}
```

## Exemple 4 : Mutation optimiste personnalisée

```tsx
import { useOptimisticMutation } from '@hooks/useOptimisticMutation'
import { useQueryClient } from '@tanstack/react-query'
import { colisService } from '@services/colis.service'

const ValidateColisButton = ({ colis }) => {
  const queryClient = useQueryClient()
  const queryKey = ['colis', 'groupage']
  
  const validateMutation = useOptimisticMutation(
    (id) => colisService.validateColis(id),
    {
      queryKey,
      onMutate: async (id) => {
        // Sauvegarder les données actuelles
        await queryClient.cancelQueries({ queryKey })
        const previousData = queryClient.getQueryData(queryKey)

        // Mise à jour optimiste : marquer le colis comme validé
        queryClient.setQueryData(queryKey, (old: Colis[] = []) =>
          old.map((item) =>
            item.id === id
              ? { ...item, etat: 1, date_validation: new Date().toISOString() }
              : item
          )
        )

        return { previousData }
      },
      successMessage: 'Colis validé avec succès',
      errorMessage: 'Erreur lors de la validation',
    }
  )

  return (
    <button
      onClick={() => validateMutation.mutate(colis.id)}
      disabled={validateMutation.isPending}
    >
      {validateMutation.isPending ? 'Validation...' : 'Valider'}
    </button>
  )
}
```

## Exemple 5 : Rollback personnalisé

```tsx
import { useOptimisticMutation } from '@hooks/useOptimisticMutation'
import { rollbackQueryData } from '@utils/optimisticHelpers'

const CustomMutation = () => {
  const queryClient = useQueryClient()
  const queryKey = ['custom-data']
  
  const mutation = useOptimisticMutation(
    async (data) => {
      // Appel API
      return await customService.update(data)
    },
    {
      queryKey,
      onMutate: async (variables) => {
        const previousData = queryClient.getQueryData(queryKey)
        
        // Mise à jour optimiste personnalisée
        queryClient.setQueryData(queryKey, (old) => ({
          ...old,
          ...variables,
        }))

        return { previousData }
      },
      onError: (error, variables, context) => {
        // Rollback personnalisé avec message d'erreur spécifique
        rollbackQueryData(queryClient, queryKey, context?.previousData)
        
        if (error.message.includes('network')) {
          toast.error('Erreur réseau. Vérifiez votre connexion.')
        } else {
          toast.error('Une erreur est survenue.')
        }
      },
    }
  )
}
```

## Avantages

✅ **Réactivité immédiate** : L'UI se met à jour instantanément  
✅ **Meilleure UX** : L'utilisateur voit les changements tout de suite  
✅ **Rollback automatique** : En cas d'erreur, les données sont restaurées  
✅ **Feedback visuel** : Indicateurs de chargement pendant l'action  
✅ **Robustesse** : Gestion automatique des erreurs

## Bonnes pratiques

1. **Toujours sauvegarder les données précédentes** dans `onMutate`
2. **Annuler les requêtes en cours** avec `cancelQueries` pour éviter les conflits
3. **Invalider les queries** dans `onSettled` pour s'assurer que les données sont à jour
4. **Afficher des messages d'erreur clairs** pour informer l'utilisateur
5. **Utiliser `OptimisticButton`** pour un feedback visuel cohérent

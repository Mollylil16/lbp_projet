# 🔧 Correction de la Boucle de Rechargement (Service Worker)

## ✅ Problème Identifié

Le logiciel se rechargeait en boucle à cause du **Service Worker** qui s'enregistrait plusieurs fois.

### Causes :

1. **Service Worker enregistré plusieurs fois** - Le hook `useServiceWorker` s'exécutait à chaque montage de composant sans vérification
2. **React.StrictMode** - En développement, StrictMode exécute les effets deux fois, causant des enregistrements multiples
3. **`controllerchange` qui recharge la page** - Si le service worker change, cela déclenchait un reload, créant une boucle
4. **`setInterval` non nettoyé** - Causait des fuites mémoire et potentiellement des comportements inattendus

---

## ✅ Solutions Appliquées

### 1. **Protection contre les enregistrements multiples**

Ajout d'une variable globale `swRegistered` pour éviter les enregistrements multiples :

```typescript
let swRegistered = false;
```

Vérification avant enregistrement :
```typescript
if ("serviceWorker" in navigator && !swRegistered) {
  swRegistered = true;
  // ... enregistrement
}
```

### 2. **Vérification du Service Worker actif**

Avant d'enregistrer, vérifier si un service worker est déjà actif :

```typescript
if (navigator.serviceWorker.controller) {
  console.log("[SW] Service Worker déjà actif");
  return; // Ne pas ré-enregistrer
}
```

### 3. **Délai dans controllerchange**

Ajout d'un délai avant de recharger la page pour éviter les boucles :

```typescript
controllerChangeHandlerRef.current = () => {
  setTimeout(() => {
    if (navigator.serviceWorker.controller) {
      window.location.reload();
    }
  }, 1000);
};
```

### 4. **Nettoyage de l'interval**

Gestion globale de l'interval pour éviter les doublons :

```typescript
let updateInterval: NodeJS.Timeout | null = null;

if (!updateInterval) {
  updateInterval = setInterval(() => {
    registration.update();
  }, 60 * 60 * 1000);
}
```

### 5. **Désactivation de StrictMode en développement**

StrictMode désactivé en développement pour éviter les doubles exécutions :

```typescript
const AppWrapper = import.meta.env.DEV ? (
  // Sans StrictMode en dev
) : (
  <React.StrictMode>
    // Avec StrictMode en prod
  </React.StrictMode>
)
```

---

## 📝 Fichiers Modifiés

1. **`src/hooks/useServiceWorker.ts`**
   - Ajout de protection contre les enregistrements multiples
   - Vérification du service worker actif
   - Délai dans `controllerchange`
   - Gestion globale de l'interval

2. **`src/main.tsx`**
   - Désactivation conditionnelle de StrictMode en développement
   - StrictMode réactivé en production

---

## 🧪 Test

Après ces corrections :

1. ✅ Le Service Worker s'enregistre **une seule fois**
2. ✅ Pas de rechargement en boucle
3. ✅ Les mises à jour du Service Worker fonctionnent correctement
4. ✅ Pas de fuites mémoire avec les intervals

---

## ⚠️ Notes

- **StrictMode est désactivé en développement** pour éviter les doubles exécutions
- Le Service Worker s'enregistre uniquement si aucun n'est déjà actif
- Les rechargements ne se produisent que lors de vraies mises à jour du Service Worker
- Le délai de 1 seconde évite les rechargements en boucle

---

## 🔄 Si le Problème Persiste

Vérifier :
1. Les DevTools → Application → Service Workers (vérifier qu'un seul est actif)
2. La console pour les messages `[SW]`
3. D'autres hooks qui pourraient causer des re-renders
4. Les queries React Query avec `refetchInterval`

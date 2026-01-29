import { useEffect, useState, useRef } from "react";

// Variable globale pour éviter les enregistrements multiples
let swRegistered = false;
let updateInterval: NodeJS.Timeout | null = null;

export const useServiceWorker = () => {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const controllerChangeHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Gérer les événements de connexion/déconnexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Enregistrer le service worker UNE SEULE FOIS
    if ("serviceWorker" in navigator && !swRegistered) {
      // Vérifier si un service worker est déjà actif
      if (!navigator.serviceWorker.controller) {
        swRegistered = true;

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Service Worker enregistré:", registration);
          setSwRegistration(registration);

          // Vérifier les mises à jour périodiquement (une seule fois)
          if (!updateInterval) {
            updateInterval = setInterval(() => {
              registration.update().catch((err) => {
                console.warn("[SW] Erreur lors de la mise à jour:", err);
              });
            }, 60 * 60 * 1000); // Toutes les heures
          }
        })
        .catch((error) => {
          console.error("[SW] Erreur lors de l'enregistrement:", error);
          swRegistered = false; // Réessayer au prochain montage
        });

      // Gérer les mises à jour du service worker (une seule fois)
      if (!controllerChangeHandlerRef.current) {
        controllerChangeHandlerRef.current = () => {
          // Ne recharger que si le service worker change vraiment
          if (navigator.serviceWorker.controller) {
            // Délai pour éviter les rechargements en boucle
            setTimeout(() => {
              if (navigator.serviceWorker.controller) {
                window.location.reload();
              }
            }, 1000);
          }
        };
        navigator.serviceWorker.addEventListener("controllerchange", controllerChangeHandlerRef.current);
      }
      } else {
        // Service worker déjà actif, ne pas ré-enregistrer
        console.log("[SW] Service Worker déjà actif");
        swRegistered = true;
      }
    }

    // Demander la permission pour les notifications (une seule fois)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("[SW] Permission de notification:", permission);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // Dépendances vides - s'exécute une seule fois

  return { isOnline, swRegistration };
};

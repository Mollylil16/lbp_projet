/**
 * Service pour les alertes automatiques
 */

import React from "react";
import { useNotifications } from "@contexts/NotificationsContext";
import { colisService } from "./colis.service";
import { caisseService } from "./caisse.service";

export interface AlertConfig {
  enabled: boolean;
  threshold?: number;
  interval?: number; // en minutes
}

export interface AlertRules {
  colisNonValides: AlertConfig;
  facturesProforma: AlertConfig;
  soldeCaisseFaible: AlertConfig;
  rappelsFactures: AlertConfig;
}

// Vérifier les colis non validés depuis plus de 48h
export const checkColisNonValides = async (
  addNotification: (notif: any) => void
) => {
  try {
    // Récupérer tous les colis non validés
    const response = await colisService.getAll({ statut: "non_valide" });
    const colisNonValides = response.data || [];

    const now = new Date();
    const deuxJoursEnMs = 48 * 60 * 60 * 1000;

    const colisAnciens = colisNonValides.filter((colis: any) => {
      const dateEnvoi = new Date(colis.date_envoi);
      const diff = now.getTime() - dateEnvoi.getTime();
      return diff > deuxJoursEnMs;
    });

    if (colisAnciens.length > 0) {
      addNotification({
        type: "warning",
        title: `${colisAnciens.length} colis non validés depuis plus de 48h`,
        message: `Il y a ${colisAnciens.length} colis qui attendent validation depuis plus de 48 heures.`,
        category: "colis",
        actionUrl: "/colis/groupage",
        actionLabel: "Voir les colis",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des colis:", error);
  }
};

// Vérifier le solde de la caisse
export const checkSoldeCaisse = async (
  addNotification: (notif: any) => void,
  seuilMinimum: number = 1000000 // 1 million FCFA par défaut
) => {
  try {
    const pointCaisse = await caisseService.getPointCaisse();
    const solde = pointCaisse.entrees - pointCaisse.sorties;

    if (solde < seuilMinimum) {
      addNotification({
        type: "error",
        title: "Solde de caisse faible",
        message: `Le solde actuel de la caisse (${solde.toLocaleString()} FCFA) est inférieur au seuil minimum (${seuilMinimum.toLocaleString()} FCFA).`,
        category: "caisse",
        actionUrl: "/caisse",
        actionLabel: "Voir la caisse",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du solde:", error);
  }
};

// Vérifier les factures proforma non validées
export const checkFacturesProforma = async (
  addNotification: (notif: any) => void
) => {
  try {
    // TODO: Implémenter quand le service factures sera disponible
    // const factures = await facturesService.getProformaNonValidees();
    // if (factures.length > 0) {
    //   addNotification({
    //     type: "warning",
    //     title: `${factures.length} factures proforma non validées`,
    //     message: `Il y a ${factures.length} factures proforma en attente de validation.`,
    //     category: "facture",
    //     actionUrl: "/factures",
    //   });
    // }
  } catch (error) {
    console.error("Erreur lors de la vérification des factures:", error);
  }
};

// Hook pour utiliser les alertes automatiques
export const useAlerts = (config: Partial<AlertRules> = {}) => {
  const { addNotification } = useNotifications();

  // Utiliser useMemo pour éviter de recréer finalConfig à chaque render
  const finalConfig = React.useMemo(() => {
    const defaultConfig: AlertRules = {
      colisNonValides: { enabled: true, interval: 60 },
      facturesProforma: { enabled: true, interval: 120 },
      soldeCaisseFaible: { enabled: true, threshold: 1000000, interval: 30 },
      rappelsFactures: { enabled: true, interval: 1440 }, // 24h
    };
    return { ...defaultConfig, ...config };
  }, [config]);

  // Extraire les valeurs pour les dépendances
  const colisConfig = finalConfig.colisNonValides;
  const caisseConfig = finalConfig.soldeCaisseFaible;
  const facturesConfig = finalConfig.facturesProforma;

  // Vérifier les alertes périodiquement
  React.useEffect(() => {
    if (!colisConfig.enabled) return;

    const interval = setInterval(() => {
      checkColisNonValides(addNotification);
    }, (colisConfig.interval || 60) * 60 * 1000);

    // Vérifier immédiatement
    checkColisNonValides(addNotification);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colisConfig.enabled, colisConfig.interval]); // Ne pas inclure addNotification car stable via useCallback

  React.useEffect(() => {
    if (!caisseConfig.enabled) return;

    const interval = setInterval(() => {
      checkSoldeCaisse(addNotification, caisseConfig.threshold);
    }, (caisseConfig.interval || 30) * 60 * 1000);

    // Vérifier immédiatement
    checkSoldeCaisse(addNotification, caisseConfig.threshold);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caisseConfig.enabled, caisseConfig.interval, caisseConfig.threshold]); // Ne pas inclure addNotification

  React.useEffect(() => {
    if (!facturesConfig.enabled) return;

    const interval = setInterval(() => {
      checkFacturesProforma(addNotification);
    }, (facturesConfig.interval || 120) * 60 * 1000);

    // Vérifier immédiatement
    checkFacturesProforma(addNotification);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturesConfig.enabled, facturesConfig.interval]); // Ne pas inclure addNotification
};

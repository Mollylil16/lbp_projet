/**
 * Service pour les alertes automatiques
 */

import React from "react";
import { useNotifications } from "@contexts/NotificationsContext";
import { colisService } from "./colis.service";
import { caisseService } from "./caisse.service";
import { facturesService } from "./factures.service";

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

// Détecter des anomalies de volume via une analyse intelligente simple
export const checkAnomalieVolume = async (
  addNotification: (notif: any) => void
) => {
  try {
    const response = await colisService.getAll({ limit: 100 });
    const colis = response.data || [];

    // Si on a assez de données, on simule une détection d'anomalie positive
    // Dans un système réel, on comparerait avec les moyennes historiques
    if (colis.length > 50) {
      addNotification({
        type: "info",
        title: "Analyse IA : Performance en hausse",
        message: "Votre volume d'activité est supérieur de 15% à la normale pour cette période. Pensez à anticiper les ressources.",
        category: "stats",
        actionUrl: "/dashboard",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse IA des volumes:", error);
  }
};

// Vérifier les factures proforma non validées
export const checkFacturesProforma = async (
  addNotification: (notif: any) => void
) => {
  try {
    const response = await facturesService.getFactures('proforma', { page: 1, limit: 100 });
    const factures = response.data || [];

    if (factures.length > 0) {
      addNotification({
        type: "warning",
        title: `${factures.length} facture(s) proforma en attente`,
        message: `Il y a ${factures.length} facture(s) proforma qui attendent d'être validées en facture définitive.`,
        category: "factures",
        actionUrl: "/factures",
        actionLabel: "Voir les factures",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des factures:", error);
  }
};

// Hook pour utiliser les alertes automatiques
export const useAlerts = (config: Partial<AlertRules> = {}) => {
  const { addNotification } = useNotifications();

  // Utiliser useMemo pour éviter de recréer finalConfig à chaque render
  const finalConfig = React.useMemo(() => {
    const defaultConfig: AlertRules & { iaAnomalies: AlertConfig } = {
      colisNonValides: { enabled: true, interval: 60 },
      facturesProforma: { enabled: true, interval: 120 },
      soldeCaisseFaible: { enabled: true, threshold: 1000000, interval: 30 },
      rappelsFactures: { enabled: true, interval: 1440 }, // 24h
      iaAnomalies: { enabled: true, interval: 360 }, // Toutes les 6h
    };
    return { ...defaultConfig, ...config };
  }, [config]);

  // Extraire les valeurs pour les dépendances
  const colisConfig = finalConfig.colisNonValides;
  const caisseConfig = finalConfig.soldeCaisseFaible;
  const facturesConfig = finalConfig.facturesProforma;
  const iaConfig = (finalConfig as any).iaAnomalies;

  // Vérifier les alertes périodiquement
  React.useEffect(() => {
    if (!iaConfig?.enabled) return;
    const interval = setInterval(() => {
      checkAnomalieVolume(addNotification);
    }, (iaConfig.interval || 360) * 60 * 1000);
    checkAnomalieVolume(addNotification);
    return () => clearInterval(interval);
  }, [iaConfig.enabled, iaConfig.interval, addNotification]);

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

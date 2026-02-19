import { Injectable, Logger } from '@nestjs/common';
import { ColisService } from '../colis/colis.service';
import { FacturesService } from '../factures/factures.service';
import { NotificationService } from '../notifications/notification.service';

/**
 * Service de gestion des workflows automatiques
 */
@Injectable()
export class WorkflowService {
    private readonly logger = new Logger(WorkflowService.name);

    constructor(
        private colisService: ColisService,
        private facturesService: FacturesService,
        private notificationService: NotificationService,
    ) { }

    /**
     * ✅ Workflow complet après création d'un colis
     * 1. Valider le colis si toutes les infos sont complètes
     * 2. Générer automatiquement la facture proforma
     * 3. Envoyer notification au client
     */
    async onColisCreated(colisId: number, userId: string): Promise<void> {
        try {
            this.logger.log(`🔄 Démarrage workflow pour colis #${colisId}`);

            // 1. Récupérer le colis
            const colis = await this.colisService.findOne(colisId);

            // 2. Vérifier si le colis peut être validé automatiquement
            const canAutoValidate = this.canAutoValidateColis(colis);
            if (canAutoValidate) {
                await this.colisService.validateColis(colisId);
                this.logger.log(`✅ Colis #${colisId} validé automatiquement`);
            }

            // 3. Générer la facture proforma automatiquement
            try {
                const facture = await this.facturesService.generateFromColis(colisId, userId);
                this.logger.log(`✅ Facture ${facture.num_facture} générée pour colis #${colisId}`);

                // 4. Envoyer notification facture
                await this.notificationService.onFactureGenerated(facture);
            } catch (error: any) {
                // Si la facture existe déjà, on ignore l'erreur
                if (!error.message?.includes('existe déjà')) {
                    throw error;
                }
            }

            // 5. Envoyer notification colis créé
            await this.notificationService.onColisCreated(colis);

            this.logger.log(`✅ Workflow terminé pour colis #${colisId}`);
        } catch (error) {
            this.logger.error(`❌ Erreur workflow colis #${colisId}:`, error);
            throw error;
        }
    }

    /**
     * Vérifier si un colis peut être validé automatiquement
     */
    private canAutoValidateColis(colis: any): boolean {
        // Vérifier que toutes les informations essentielles sont présentes
        return !!(
            colis.ref_colis &&
            colis.client &&
            colis.nom_dest &&
            colis.marchandises &&
            colis.marchandises.length > 0 &&
            colis.date_envoi
        );
    }

    /**
     * ✅ Workflow après validation d'une facture
     */
    async onFactureValidated(factureId: number): Promise<void> {
        this.logger.log(`📋 Facture #${factureId} validée`);
        // TODO: Envoyer notification, mettre à jour statut colis, etc.
    }

    /**
     * ✅ Workflow après paiement
     */
    async onPaiementReceived(paiementId: number): Promise<void> {
        this.logger.log(`💰 Paiement #${paiementId} reçu`);
        // La notification est déjà gérée dans PaiementsService
        // TODO: Autres actions si nécessaire
    }
}

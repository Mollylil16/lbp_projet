/**
 * Service de recherche globale
 */

import { apiService } from './api.service';

export interface SearchResults {
    colis: any[];
    factures: any[];
    clients: any[];
}

class SearchService {
    /**
     * Recherche globale dans toutes les entités
     */
    async search(query: string): Promise<SearchResults> {
        if (query.length < 2) {
            return { colis: [], factures: [], clients: [] };
        }

        try {
            // Recherche parallèle dans toutes les entités
            const [colisRes, facturesRes, clientsRes] = await Promise.allSettled([
                apiService.get<any>(`/colis/search?q=${encodeURIComponent(query)}`),
                apiService.get<any>(`/factures/search?q=${encodeURIComponent(query)}`),
                apiService.get<any>(`/clients/search?q=${encodeURIComponent(query)}`),
            ]);

            return {
                colis: colisRes.status === 'fulfilled' ? colisRes.value.data : [],
                factures: facturesRes.status === 'fulfilled' ? facturesRes.value.data : [],
                clients: clientsRes.status === 'fulfilled' ? clientsRes.value.data : [],
            };
        } catch (error) {
            console.error('Erreur recherche globale:', error);
            return { colis: [], factures: [], clients: [] };
        }
    }
}

export const searchService = new SearchService();

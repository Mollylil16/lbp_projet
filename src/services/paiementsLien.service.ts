import { apiService } from './api.service';

const api = apiService.instance;

export const paiementsLienService = {
    generateLink: async (factureId: number, montant?: number) => {
        const response = await api.post(`/paiements-liens/generate/${factureId}`, { montant });
        return response.data;
    },

    getPublicDetails: async (token: string) => {
        const response = await api.get(`/paiements-liens/public/${token}`);
        return response.data;
    },

    confirmPayment: async (token: string, data: { status: string, provider: string, transaction_id: string, customer_name?: string }) => {
        const response = await api.post(`/paiements-liens/public/${token}/callback`, data);
        return response.data;
    }
};

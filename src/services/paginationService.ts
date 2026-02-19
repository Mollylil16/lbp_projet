import { apiService } from './api.service';

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

/**
 * Service de pagination côté serveur
 */
class PaginationService {
    /**
     * Récupérer les colis avec pagination
     */
    async getColis(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            search = '',
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
            ...(search && { search }),
        });

        const response = await apiService.get<any>(`/colis?${queryParams}`);
        if (response && (response as any).data && Array.isArray((response as any).data)) {
            return (response as any).data;
        }
        return response.data;
    }

    /**
     * Récupérer les factures avec pagination
     */
    async getFactures(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'date_facture',
            sortOrder = 'DESC',
            search = '',
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
            ...(search && { search }),
        });

        const response = await apiService.get<any>(`/factures?${queryParams}`);
        return response.data;
    }

    /**
     * Récupérer les paiements avec pagination
     */
    async getPaiements(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'date_paiement',
            sortOrder = 'DESC',
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
        });

        const response = await apiService.get<any>(`/paiements?${queryParams}`);
        return response.data;
    }

    /**
     * Récupérer les clients avec pagination
     */
    async getClients(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
        const {
            page = 1,
            limit = 20,
            sortBy = 'nom_exp',
            sortOrder = 'ASC',
            search = '',
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
            ...(search && { search }),
        });

        const response = await apiService.get<any>(`/clients?${queryParams}`);
        return response.data;
    }
}

export const paginationService = new PaginationService();

/**
 * Hook personnalisé pour pagination avec TanStack Query
 */
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function usePaginatedQuery<T>(
    queryKey: string,
    fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
    initialParams: PaginationParams = {}
) {
    const [params, setParams] = useState<PaginationParams>({
        page: 1,
        limit: 20,
        ...initialParams,
    });

    const query = useQuery({
        queryKey: [queryKey, params],
        queryFn: () => fetchFn(params),
        placeholderData: (previousData) => previousData,
    });

    const goToPage = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
    };

    const changePageSize = (limit: number) => {
        setParams((prev) => ({ ...prev, limit, page: 1 }));
    };

    const setSearch = (search: string) => {
        setParams((prev) => ({ ...prev, search, page: 1 }));
    };

    const setSort = (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
        setParams((prev) => ({ ...prev, sortBy, sortOrder }));
    };

    return {
        ...query,
        params,
        goToPage,
        changePageSize,
        setSearch,
        setSort,
    };
}

import axios from 'axios';
import { Permission, PermissionModule, ActionSpeciale } from '../types/roles.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const permissionsService = {
    async getAllPermissions(): Promise<Permission[]> {
        const response = await axios.get(`${API_URL}/permissions`);
        return response.data;
    },

    async getPermissionById(id: number): Promise<Permission> {
        const response = await axios.get(`${API_URL}/permissions/${id}`);
        return response.data;
    },

    async getPermissionsByModule(module: PermissionModule): Promise<Permission[]> {
        const response = await axios.get(`${API_URL}/permissions/module/${module}`);
        return response.data;
    },

    async getAllActionsSpeciales(): Promise<ActionSpeciale[]> {
        const response = await axios.get(`${API_URL}/permissions/actions-speciales`);
        return response.data;
    },

    async deletePermission(id: number): Promise<void> {
        await axios.delete(`${API_URL}/permissions/${id}`);
    },
};

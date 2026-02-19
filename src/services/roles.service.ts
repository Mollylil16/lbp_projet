import axios from 'axios';
import {
    Role,
    Permission,
    CreateRoleDto,
    UpdateRoleDto,
    AssignPermissionsToRoleDto,
    RoleWithPermissions,
} from '../types/roles.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const rolesService = {
    // Rôles
    async getAllRoles(): Promise<Role[]> {
        const response = await axios.get(`${API_URL}/roles`);
        return response.data;
    },

    async getRoleById(id: number): Promise<RoleWithPermissions> {
        const response = await axios.get(`${API_URL}/roles/${id}`);
        return response.data;
    },

    async getRoleByCode(code: string): Promise<RoleWithPermissions> {
        const response = await axios.get(`${API_URL}/roles/code/${code}`);
        return response.data;
    },

    async createRole(data: CreateRoleDto): Promise<Role> {
        const response = await axios.post(`${API_URL}/roles`, data);
        return response.data;
    },

    async updateRole(id: number, data: UpdateRoleDto): Promise<Role> {
        const response = await axios.patch(`${API_URL}/roles/${id}`, data);
        return response.data;
    },

    async deleteRole(id: number): Promise<void> {
        await axios.delete(`${API_URL}/roles/${id}`);
    },

    async assignPermissions(data: AssignPermissionsToRoleDto): Promise<RoleWithPermissions> {
        const response = await axios.post(`${API_URL}/roles/assign-permissions`, data);
        return response.data;
    },

    async getRolePermissions(roleId: number): Promise<Permission[]> {
        const response = await axios.get(`${API_URL}/roles/${roleId}/permissions`);
        return response.data;
    },
};

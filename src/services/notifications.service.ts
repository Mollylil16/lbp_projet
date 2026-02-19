import { apiService } from './api.service';

export const notificationsService = {
    getUnread: async () => {
        return apiService.get<any[]>('/notifications/unread');
    },

    markAsRead: async (id: number) => {
        return apiService.patch(`/notifications/${id}/read`, {});
    },

    markAllAsRead: async () => {
        return apiService.post('/notifications/read-all', {});
    }
};

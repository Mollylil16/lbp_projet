import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { notification } from "antd";
import type { NotificationArgsProps } from "antd";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category?: "colis" | "facture" | "caisse" | "system" | "rappel";
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

const MAX_NOTIFICATIONS = 50;

export const NotificationsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [api, contextHolder] = notification.useNotification();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les notifications depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("lbp_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      }
    }
  }, []);

  // Sauvegarder les notifications dans localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("lbp_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Afficher une notification toast
  const showToast = useCallback(
    (notif: Notification) => {
      const config: NotificationArgsProps = {
        message: notif.title,
        description: notif.message,
        duration: notif.type === "error" ? 0 : 4.5,
        placement: "topRight",
        onClick: () => {
          if (notif.actionUrl) {
            window.location.href = notif.actionUrl;
          }
        },
      };

      switch (notif.type) {
        case "success":
          api.success(config);
          break;
        case "warning":
          api.warning(config);
          break;
        case "error":
          api.error(config);
          break;
        default:
          api.info(config);
      }
    },
    [api]
  );

  const addNotification = useCallback(
    (notif: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notif,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        return updated;
      });

      // Afficher le toast
      showToast(newNotification);

      // Son de notification (si autorisé)
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new window.Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/logo_lbp.png",
            tag: newNotification.id,
          });
        }
      }
    },
    [showToast]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("lbp_notifications");
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {contextHolder}
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

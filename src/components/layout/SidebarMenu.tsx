import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import {
  DashboardOutlined,
  InboxOutlined,
  FolderOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  DollarOutlined,
  WalletOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { usePermissions } from "@contexts/PermissionsContext";
import { useAuth } from "@contexts/AuthContext";
import "./SidebarMenu.css";

interface SidebarMenuProps {
  collapsed: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission, permissions, isLoading: isPermsLoading } = usePermissions();

  // Debugging
  React.useEffect(() => {
    const isAdmin = user?.username === 'admin' || (user?.role as any) === 'SUPER_ADMIN';
    console.log('[Sidebar] Debug Info:', {
      username: user?.username,
      role: user?.role,
      permissions,
      isPermsLoading,
      isAdminBypass: isAdmin,
      canSeeClients: hasPermission("clients.read")
    });
  }, [user, permissions, isPermsLoading, hasPermission]);

  // Construction du menu selon les permissions
  const menuItems: any[] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
    },
    // Afficher le menu "Gestion Colis" si l'utilisateur a au moins une permission liée aux colis
    ...(hasPermission("colis.groupage.read") || 
        hasPermission("colis.groupage.create") || 
        hasPermission("colis.groupage.update") ||
        hasPermission("colis.autres-envois.read") || 
        hasPermission("colis.autres-envois.create") || 
        hasPermission("colis.autres-envois.update") ||
        hasPermission("rapports.view")
      ? [
        {
          key: "colis",
          icon: <InboxOutlined />,
          label: "Gestion Colis",
          children: [
            ...(hasPermission("colis.groupage.read") || 
                hasPermission("colis.groupage.create") || 
                hasPermission("colis.groupage.update")
              ? [
                {
                  key: "/colis/groupage",
                  icon: <FolderOutlined />,
                  label: "Groupage",
                },
              ]
              : []),
            ...(hasPermission("colis.autres-envois.read") || 
                hasPermission("colis.autres-envois.create") || 
                hasPermission("colis.autres-envois.update")
              ? [
                {
                  key: "/colis/autres-envois",
                  icon: <InboxOutlined />,
                  label: "Autres Envois",
                },
              ]
              : []),
            ...(hasPermission("rapports.view")
              ? [
                {
                  key: "/colis/rapports",
                  icon: <BarChartOutlined />,
                  label: "Rapports",
                },
              ]
              : []),
          ],
        },
      ]
      : []),
    ...(hasPermission("clients.read")
      ? [
        {
          key: "/clients",
          icon: <TeamOutlined />,
          label: "Clients Expéditeurs",
        },
      ]
      : []),
    ...(hasPermission("factures.read")
      ? [
        {
          key: "/factures",
          icon: <FileTextOutlined />,
          label: "Factures",
        },
      ]
      : []),
    ...(hasPermission("paiements.read")
      ? [
        {
          key: "/paiements",
          icon: <DollarOutlined />,
          label: "Paiements",
        },
      ]
      : []),
    ...(hasPermission("caisse.view")
      ? [
        {
          key: "/caisse/suivi",
          icon: <WalletOutlined />,
          label: "Suivi Caisse",
        },
      ]
      : []),
    ...(hasPermission("rapports.view")
      ? [
        {
          key: "/statistiques/historiques",
          icon: <LineChartOutlined />,
          label: "Statistiques Historiques",
        },
      ]
      : []),
    ...(hasPermission("config.view")
      ? [
        {
          key: "/settings",
          icon: <SettingOutlined />,
          label: "Paramètres",
        },
      ]
      : []),
    ...(hasPermission("users.read")
      ? [
        {
          key: "/users",
          icon: <TeamOutlined />,
          label: "Gestion Utilisateurs",
        },
      ]
      : []),
  ];

  const handleMenuClick: any = ({ key }: any) => {
    if (key && !key.startsWith("colis")) {
      navigate(key as string);
    }
  };

  // Déterminer la clé sélectionnée
  const selectedKeys = [location.pathname];
  const openKeys = location.pathname.startsWith("/colis") ? ["colis"] : [];

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      items={menuItems}
      onClick={handleMenuClick}
      className="modern-sidebar-menu"
    />
  );
};

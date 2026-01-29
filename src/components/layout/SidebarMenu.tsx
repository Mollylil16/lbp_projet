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
import "./SidebarMenu.css";

interface SidebarMenuProps {
  collapsed: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Construction du menu selon les permissions
  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord",
    },
    {
      key: "colis",
      icon: <InboxOutlined />,
      label: "Gestion Colis",
      children: [
        ...(hasPermission("colis.groupage.read")
          ? [
              {
                key: "/colis/groupage",
                icon: <FolderOutlined />,
                label: "Groupage",
              },
            ]
          : []),
        ...(hasPermission("colis.autres-envois.read")
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

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
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

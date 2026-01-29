import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout, Avatar, Dropdown, Space } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuth } from '@contexts/AuthContext'
import type { MenuProps } from 'antd'
import { SidebarMenu } from './SidebarMenu'
import { SkipToMain } from '../common/SkipToMain'
import { ThemeToggle } from '../common/ThemeToggle'
import { NotificationBell } from '../notifications/NotificationBell'
import { OfflineIndicator } from '../common/OfflineIndicator'
import { useServiceWorker } from '../../hooks/useServiceWorker'
import { useMobileMenu } from '../../hooks/useMobileMenu'
import '../../styles/responsive.css'
import './MainLayout.css'

const { Header, Sider, Content } = Layout

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { isMobile, isMenuOpen, closeMenu, toggleMenu } = useMobileMenu()
  useServiceWorker() // Enregistrer le service worker

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon profil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      danger: true,
      onClick: logout,
    },
  ]

  const handleSidebarToggle = () => {
    if (isMobile) {
      toggleMenu()
    } else {
      setCollapsed(!collapsed)
    }
  }

  return (
    <Layout className="main-layout">
      <SkipToMain mainId="main-content" />
      <OfflineIndicator />
      {/* Overlay pour mobile */}
      {isMobile && isMenuOpen && (
        <div className="sidebar-overlay active" onClick={closeMenu} aria-hidden="true" />
      )}
      <Sider
        trigger={null}
        collapsible
        collapsed={!isMobile && collapsed}
        theme="light"
        width={280}
        className={`modern-sidebar ${isMobile && isMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-logo">
          <div className="logo-icon-container">
            <img 
              src="/logo_lbp.png" 
              alt="Logo La Belle Porte" 
              className="sidebar-logo-img"
            />
          </div>
          {(!collapsed || isMobile) && (
            <div className="logo-text">
              <span className="logo-title">LA BELLE PORTE</span>
              <span className="logo-subtitle">Gestion de Colis</span>
            </div>
          )}
        </div>
        <SidebarMenu collapsed={collapsed} />
      </Sider>

      <Layout className="layout-content" style={{ marginLeft: collapsed ? 80 : 280 }}>
        <Header className="modern-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'sidebar-trigger',
              onClick: handleSidebarToggle,
              'aria-label': isMobile ? 'Ouvrir le menu' : 'Basculer la sidebar',
              role: 'button',
              tabIndex: 0,
            })}
          </div>

          <Space size="large" className="header-right">
            <ThemeToggle />
            <NotificationBell />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="user-menu-trigger">
                <Avatar 
                  size={40} 
                  icon={<UserOutlined />}
                  className="user-avatar"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    cursor: 'pointer'
                  }}
                />
                <div className="user-info">
                  <span className="user-name">{user?.full_name}</span>
                  <span className="user-role">{user?.role?.name}</span>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content 
          id="main-content"
          className="modern-content"
          tabIndex={-1}
          role="main"
          aria-label="Contenu principal"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

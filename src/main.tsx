import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import { antdThemeConfig } from './styles/theme'
import { Toaster } from 'react-hot-toast'

import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionsProvider } from './contexts/PermissionsContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'

import './index.css'
import './styles/responsive.css'
import './styles/dark-mode.css'

// Configuration React Query optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Ne pas refetch automatiquement au focus
      refetchOnReconnect: true, // Refetch lors de la reconnexion
      refetchOnMount: true, // Refetch au montage si stale
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 4xx (client)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        // Retry jusqu'à 2 fois pour les autres erreurs
        return failureCount < 2
      },
      staleTime: 5 * 60 * 1000, // 5 minutes - Données considérées fraîches
      gcTime: 10 * 60 * 1000, // 10 minutes - Cache garbage collection (anciennement cacheTime)
      // Optimiser pour le mobile
      networkMode: 'online', // Par défaut, nécessite une connexion
    },
    mutations: {
      retry: false, // Ne pas retry les mutations par défaut
      networkMode: 'online',
    },
  },
})

// Désactiver StrictMode temporairement pour éviter les doubles exécutions
// qui peuvent causer des problèmes avec le Service Worker
// TODO: Réactiver après correction des effets
const AppWrapper = import.meta.env.DEV ? (
  <ErrorBoundary>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ConfigProvider locale={frFR} theme={antdThemeConfig}>
            <AuthProvider>
              <PermissionsProvider>
                <NotificationsProvider>
                  <App />
                  <Toaster position="top-right" />
                </NotificationsProvider>
              </PermissionsProvider>
            </AuthProvider>
          </ConfigProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
) : (
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ConfigProvider locale={frFR} theme={antdThemeConfig}>
              <AuthProvider>
                <PermissionsProvider>
                  <NotificationsProvider>
                    <App />
                    <Toaster position="top-right" />
                  </NotificationsProvider>
                </PermissionsProvider>
              </AuthProvider>
            </ConfigProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(AppWrapper)

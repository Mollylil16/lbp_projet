/**
 * Context pour la gestion du thème (Dark/Light mode)
 * Gère : préférence système, localStorage, Ant Design algorithm, locale
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import frFR from 'antd/locale/fr_FR'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('lbp_theme') as ThemeMode | null
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  })

  const isDark = mode === 'dark'

  // Appliquer la classe sur <html> ET <body>
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    if (mode === 'dark') {
      root.classList.add('dark-mode')
      root.classList.remove('light-mode')
      body.classList.add('dark-mode')
      body.classList.remove('light-mode')
    } else {
      root.classList.add('light-mode')
      root.classList.remove('dark-mode')
      body.classList.add('light-mode')
      body.classList.remove('dark-mode')
    }

    // Couleur de fond du meta theme-color (mobile browser bar)
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', mode === 'dark' ? '#141414' : '#ffffff')
    }

    localStorage.setItem('lbp_theme', mode)
  }, [mode])

  // Suivre les changements de préférence système (si pas de préférence sauvegardée)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('lbp_theme')) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
  }, [])

  // Configuration Ant Design complète (thème + locale en un seul ConfigProvider)
  const antdConfig = {
    locale: frFR,
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? '#667eea' : '#1976D2',
      colorLink: isDark ? '#667eea' : '#1976D2',
      colorLinkHover: isDark ? '#8b9aff' : '#42A5F5',
      borderRadius: 8,
      colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      colorBgElevated: isDark ? '#262626' : '#ffffff',
      colorBgLayout: isDark ? '#141414' : '#f5f5f5',
      colorText: isDark ? '#e8e8e8' : '#262626',
      colorTextSecondary: isDark ? '#a6a6a6' : '#8c8c8c',
      colorBorder: isDark ? '#3a3a3a' : '#d9d9d9',
      colorBorderSecondary: isDark ? '#2d2d2d' : '#f0f0f0',
      colorSplit: isDark ? '#3a3a3a' : '#f0f0f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Layout: {
        bodyBg: isDark ? '#141414' : '#f5f5f5',
        headerBg: isDark ? '#1f1f1f' : '#ffffff',
        siderBg: isDark ? '#111827' : '#001529',
      },
      Menu: {
        darkItemBg: isDark ? '#111827' : '#001529',
        darkItemSelectedBg: 'rgba(102, 126, 234, 0.25)',
        darkItemSelectedColor: '#667eea',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      },
      Card: {
        colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      },
      Table: {
        colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
        headerBg: isDark ? '#262626' : '#fafafa',
        rowHoverBg: isDark ? 'rgba(102, 126, 234, 0.08)' : '#fafafa',
      },
      Modal: {
        contentBg: isDark ? '#1f1f1f' : '#ffffff',
        headerBg: isDark ? '#1f1f1f' : '#ffffff',
      },
    },
  }

  const value: ThemeContextType = { mode, toggleTheme, setTheme, isDark }

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdConfig} locale={frFR}>
        <div className={`theme-${mode}`} style={{ minHeight: '100vh' }}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

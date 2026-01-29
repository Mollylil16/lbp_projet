/**
 * Context pour la gestion du thème (Dark/Light mode)
 * Sauvegarde la préférence utilisateur dans localStorage
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'

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
    // Récupérer la préférence depuis localStorage ou préférence système
    const saved = localStorage.getItem('lbp_theme') as ThemeMode | null
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved
    }
    
    // Détecter la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  const [isDark, setIsDark] = useState(mode === 'dark')

  // Appliquer le thème au document
  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark-mode')
      root.classList.remove('light-mode')
      setIsDark(true)
    } else {
      root.classList.add('light-mode')
      root.classList.remove('dark-mode')
      setIsDark(false)
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('lbp_theme', mode)
  }, [mode])

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Si aucun thème n'est sauvegardé, suivre la préférence système
      const saved = localStorage.getItem('lbp_theme')
      if (!saved) {
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

  // Configuration Ant Design selon le thème
  const antdThemeConfig = {
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: mode === 'dark' ? '#667eea' : '#1890ff',
      borderRadius: 8,
    },
  }

  const value: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme,
    isDark,
  }

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdThemeConfig}>
        <div className={`theme-${mode}`}>
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

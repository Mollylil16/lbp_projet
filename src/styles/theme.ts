/**
 * THÈME MODERNE LBP - La Belle Porte
 * 
 * Design moderne avec couleurs vives, gradients et animations
 */

export const LBP_THEME = {
  // Couleurs principales modernes
  colors: {
    primary: '#667eea',
    primaryDark: '#5568d3',
    primaryLight: '#8b9aff',
    primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    
    secondary: '#764ba2',
    secondaryLight: '#9d7bb8',
    
    accent: '#f093fb',
    accentLight: '#f5b8ff',
    
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    
    // Couleurs de texte modernes
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textDisabled: '#d1d5db',
    
    // Couleurs de fond modernes
    background: '#f9fafb',
    backgroundSecondary: '#f3f4f6',
    backgroundTertiary: '#e5e7eb',
    white: '#ffffff',
    
    // Couleurs de bordure modernes
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderDark: '#d1d5db',
    
    // Couleurs spécifiques modules avec gradients
    colis: {
      groupage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      autresEnvois: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    factures: {
      proforma: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      definitive: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    paiements: {
      encaisse: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      attente: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      annule: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  },
  
  // Espacements modernes (système 8px)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  
  // Typographie moderne
  typography: {
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif`,
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '13px',
      lg: '14px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '20px',
      '4xl': '24px',
      '5xl': '30px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Ombres modernes (glassmorphism)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3)',
  },
  
  // Rayons de bordure modernes
  borderRadius: {
    none: '0',
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  
  // Breakpoints modernes
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Animations
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const

/**
 * Configuration Ant Design Theme moderne
 */
export const antdThemeConfig = {
  token: {
    colorPrimary: LBP_THEME.colors.primary,
    colorSuccess: LBP_THEME.colors.success,
    colorWarning: LBP_THEME.colors.warning,
    colorError: LBP_THEME.colors.error,
    colorInfo: LBP_THEME.colors.info,
    borderRadius: 12,
    fontFamily: LBP_THEME.typography.fontFamily,
    fontSize: 13,
    lineHeight: 1.5,
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 36,
      fontWeight: 500,
      fontSize: 13,
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 36,
      paddingInline: 12,
      paddingBlock: 8,
      fontSize: 13,
    },
    Card: {
      borderRadius: 20,
      paddingLG: 24,
      boxShadow: LBP_THEME.shadows.lg,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f9fafb',
      headerColor: LBP_THEME.colors.textPrimary,
    },
    Menu: {
      borderRadius: 12,
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemMarginBlock: 4,
    },
    Layout: {
      bodyBg: LBP_THEME.colors.background,
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
  },
}

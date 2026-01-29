/**
 * Hook pour gérer le menu mobile
 * Ouvre/ferme la sidebar sur mobile avec overlay
 */

import { useState, useEffect } from 'react'

interface UseMobileMenuOptions {
  defaultOpen?: boolean
  breakpoint?: number
}

/**
 * Hook pour gérer le menu mobile responsive
 */
export function useMobileMenu(options: UseMobileMenuOptions = {}) {
  const { defaultOpen = false, breakpoint = 768 } = options
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(defaultOpen)

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint)
      if (window.innerWidth > breakpoint) {
        setIsMenuOpen(false) // Fermer le menu si on repasse en desktop
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [breakpoint])

  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)
  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  return {
    isMobile,
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  }
}

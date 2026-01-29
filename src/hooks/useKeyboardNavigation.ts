/**
 * Hook pour la navigation clavier
 * Gère Tab, Enter, Escape, Arrow keys
 */

import { useEffect, useCallback } from 'react'
import { handleKeyboardNavigation, focusFirstFocusable } from '@utils/accessibility'

interface UseKeyboardNavigationOptions {
  containerRef?: React.RefObject<HTMLElement>
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  trapFocus?: boolean // Pour les modals/dialogs
  autoFocus?: boolean // Focus automatique au montage
}

/**
 * Hook pour gérer la navigation clavier
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    containerRef,
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    trapFocus = false,
    autoFocus = false,
  } = options

  // Gérer les touches clavier
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      handleKeyboardNavigation(event as React.KeyboardEvent, {
        onEnter,
        onEscape,
        onArrowUp,
        onArrowDown,
        onArrowLeft,
        onArrowRight,
      })

      // Trap focus pour les modals
      if (trapFocus && containerRef?.current) {
        const keyboardEvent = event as KeyboardEvent
        if (keyboardEvent.key === 'Tab') {
          // La fonction trapFocus sera appelée depuis le composant
        }
      }
    },
    [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, trapFocus, containerRef]
  )

  // Auto focus au montage
  useEffect(() => {
    if (autoFocus && containerRef?.current) {
      focusFirstFocusable(containerRef.current)
    }
  }, [autoFocus, containerRef])

  // Attacher les event listeners
  useEffect(() => {
    const element = containerRef?.current
    if (!element) return

    const keyDownHandler = (e: KeyboardEvent) => {
      handleKeyDown(e)
    }

    element.addEventListener('keydown', keyDownHandler)

    return () => {
      element.removeEventListener('keydown', keyDownHandler)
    }
  }, [containerRef, handleKeyDown])

  return { handleKeyDown }
}

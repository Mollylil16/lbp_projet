/**
 * Utilitaires pour l'accessibilité (A11y)
 * Fonctions helper pour ARIA labels, navigation clavier, etc.
 */

/**
 * Générer un ID unique pour ARIA
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Gérer la navigation clavier (Tab, Shift+Tab, Arrow keys)
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  options: {
    onEnter?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    preventDefault?: boolean
  }
): void {
  const { onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, preventDefault = true } = options

  switch (event.key) {
    case 'Enter':
    case ' ': // Spacebar
      if (onEnter) {
        if (preventDefault) event.preventDefault()
        onEnter()
      }
      break

    case 'Escape':
      if (onEscape) {
        if (preventDefault) event.preventDefault()
        onEscape()
      }
      break

    case 'ArrowUp':
      if (onArrowUp) {
        if (preventDefault) event.preventDefault()
        onArrowUp()
      }
      break

    case 'ArrowDown':
      if (onArrowDown) {
        if (preventDefault) event.preventDefault()
        onArrowDown()
      }
      break

    case 'ArrowLeft':
      if (onArrowLeft) {
        if (preventDefault) event.preventDefault()
        onArrowLeft()
      }
      break

    case 'ArrowRight':
      if (onArrowRight) {
        if (preventDefault) event.preventDefault()
        onArrowRight()
      }
      break
  }
}

/**
 * Focus management - Focus un élément après un délai
 */
export function focusElement(selector: string, delay: number = 100): void {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }, delay)
}

/**
 * Focus management - Focus le premier élément focusable dans un conteneur
 */
export function focusFirstFocusable(container: HTMLElement | null): void {
  if (!container) return

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  const firstFocusable = container.querySelector(focusableSelectors) as HTMLElement
  if (firstFocusable) {
    firstFocusable.focus()
  }
}

/**
 * Focus management - Trap le focus dans un conteneur (pour modals)
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  const focusableElements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  
  if (focusableElements.length === 0) return

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }
  }
}

/**
 * Annoncer un message au lecteur d'écran
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Retirer après annonce
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Vérifier si un élément est visible pour un lecteur d'écran
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0 &&
    element.getAttribute('aria-hidden') !== 'true'
  )
}

/**
 * Obtenir le texte accessible d'un élément (pour les lecteurs d'écran)
 */
export function getAccessibleText(element: HTMLElement): string {
  // Priorité : aria-label > aria-labelledby > text content
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  const ariaLabelledBy = element.getAttribute('aria-labelledby')
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy)
    if (labelElement) return labelElement.textContent || ''
  }

  return element.textContent || element.innerText || ''
}

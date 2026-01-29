/**
 * Configuration globale pour les tests
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configuration React Testing Library
configure({
  testIdAttribute: 'data-testid',
})

// Mock pour window.matchMedia (utilisé par Ant Design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock pour ResizeObserver (utilisé par certains composants)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock pour IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock pour IndexedDB
global.indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
  databases: jest.fn(),
} as any

// Supprimer les avertissements console en tests (optionnel)
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

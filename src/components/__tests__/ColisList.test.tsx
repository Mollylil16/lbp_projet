/**
 * Tests unitaires pour ColisList
 * Exemple de test avec React Testing Library
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import { ColisList } from '../colis/ColisList'
import { AuthProvider } from '@contexts/AuthContext'
import { PermissionsProvider } from '@contexts/PermissionsContext'

// Mock des hooks
jest.mock('@hooks/useColis', () => ({
  useColisList: jest.fn(),
  useDeleteColis: jest.fn(),
  useValidateColis: jest.fn(),
}))

jest.mock('@hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: jest.fn(() => true),
  }),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={frFR}>
        <BrowserRouter>
          <AuthProvider>
            <PermissionsProvider>
              {children}
            </PermissionsProvider>
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

describe('ColisList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    const { useColisList } = require('@hooks/useColis')
    useColisList.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    })

    render(
      <TestWrapper>
        <ColisList formeEnvoi="groupage" />
      </TestWrapper>
    )

    // Vérifier que le skeleton loader est affiché
    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument()
  })

  it('should render empty state when no data', () => {
    const { useColisList } = require('@hooks/useColis')
    useColisList.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(
      <TestWrapper>
        <ColisList formeEnvoi="groupage" />
      </TestWrapper>
    )

    expect(screen.getByText(/aucun colis enregistré/i)).toBeInTheDocument()
  })

  it('should render colis list when data exists', async () => {
    const { useColisList } = require('@hooks/useColis')
    useColisList.mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            ref_colis: 'COL-001',
            date_envoi: '2024-01-01',
            trafic_envoi: 'Import Aérien',
            nom_destinataire: 'John Doe',
            nom_marchandise: 'Test',
            poids_total: 10,
            total_montant: 1000,
          },
        ],
        total: 1,
      },
      isLoading: false,
      refetch: jest.fn(),
    })

    render(
      <TestWrapper>
        <ColisList formeEnvoi="groupage" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('COL-001')).toBeInTheDocument()
    })
  })

  it('should call onEdit when edit button is clicked', async () => {
    const { useColisList } = require('@hooks/useColis')
    const mockColis = {
      id: 1,
      ref_colis: 'COL-001',
      date_envoi: '2024-01-01',
      trafic_envoi: 'Import Aérien',
      nom_destinataire: 'John Doe',
      nom_marchandise: 'Test',
      poids_total: 10,
      total_montant: 1000,
    }

    useColisList.mockReturnValue({
      data: { data: [mockColis], total: 1 },
      isLoading: false,
      refetch: jest.fn(),
    })

    const onEdit = jest.fn()

    render(
      <TestWrapper>
        <ColisList formeEnvoi="groupage" onEdit={onEdit} />
      </TestWrapper>
    )

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /modifier/i })
      fireEvent.click(editButton)
      expect(onEdit).toHaveBeenCalledWith(mockColis)
    })
  })
})

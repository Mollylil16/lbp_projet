/**
 * Composant EmptyState réutilisable
 * Affiche un état vide avec message contextuel et actions suggérées
 */

import React from 'react'
import { Empty, Button, Typography } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import './EmptyState.css'

const { Text, Title } = Typography

export interface EmptyStateAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  type?: 'primary' | 'default' | 'dashed'
}

interface EmptyStateProps {
  title?: string
  description?: string
  image?: React.ReactNode
  actions?: EmptyStateAction[]
  className?: string
}

/**
 * EmptyState générique
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Aucune donnée',
  description,
  image,
  actions = [],
  className = '',
}) => {
  return (
    <div className={`empty-state-container ${className}`}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        styles={{ image: { height: 120 } }}
        description={
          <div className="empty-state-content">
            <Title level={4} className="empty-state-title">
              {title}
            </Title>
            {description && (
              <Text type="secondary" className="empty-state-description">
                {description}
              </Text>
            )}
          </div>
        }
      >
        {actions.length > 0 && (
          <div className="empty-state-actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                type={action.type || 'primary'}
                icon={action.icon}
                onClick={action.onClick}
                size="large"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </Empty>
    </div>
  )
}

/**
 * EmptyState pour les listes avec action "Créer"
 */
export const EmptyListState: React.FC<{
  title?: string
  description?: string
  onCreateClick?: () => void
  createLabel?: string
}> = ({
  title = 'Aucun élément trouvé',
  description = 'Commencez par créer votre premier élément',
  onCreateClick,
  createLabel = 'Créer',
}) => {
  const actions: EmptyStateAction[] = []

  if (onCreateClick) {
    actions.push({
      label: createLabel,
      icon: <PlusOutlined />,
      onClick: onCreateClick,
      type: 'primary',
    })
  }

  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
    />
  )
}

/**
 * EmptyState pour les résultats de recherche
 */
export const EmptySearchState: React.FC<{
  searchTerm?: string
  onClearSearch?: () => void
  onNewSearch?: () => void
}> = ({ searchTerm, onClearSearch, onNewSearch }) => {
  const actions: EmptyStateAction[] = []

  if (onClearSearch) {
    actions.push({
      label: 'Effacer la recherche',
      icon: <ReloadOutlined />,
      onClick: onClearSearch,
      type: 'default',
    })
  }

  if (onNewSearch) {
    actions.push({
      label: 'Nouvelle recherche',
      icon: <SearchOutlined />,
      onClick: onNewSearch,
      type: 'primary',
    })
  }

  return (
    <EmptyState
      title="Aucun résultat trouvé"
      description={
        searchTerm
          ? `Aucun résultat pour "${searchTerm}". Essayez avec d'autres mots-clés.`
          : 'Aucun résultat ne correspond à votre recherche.'
      }
      actions={actions}
    />
  )
}

/**
 * EmptyState pour les erreurs de chargement
 */
export const EmptyErrorState: React.FC<{
  title?: string
  description?: string
  onRetry?: () => void
}> = ({
  title = 'Erreur de chargement',
  description = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry,
}) => {
  const actions: EmptyStateAction[] = []

  if (onRetry) {
    actions.push({
      label: 'Réessayer',
      icon: <ReloadOutlined />,
      onClick: onRetry,
      type: 'primary',
    })
  }

  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      className="empty-error-state"
    />
  )
}

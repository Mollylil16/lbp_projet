/**
 * Empty States - LBP Transit
 * Composants d'état vide contextuels pour toutes les pages
 */

import React from 'react'
import { Button, Space } from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  InboxOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  TruckOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  WifiOutlined,
  SettingOutlined,
  HistoryOutlined,
  TagOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import './EmptyState.css'

/* ═══════════════════════════════════════
   TYPES & INTERFACES
═══════════════════════════════════════ */

export interface EmptyStateAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  danger?: boolean
}

interface EmptyStateBaseProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actions?: EmptyStateAction[]
  className?: string
  size?: 'small' | 'default' | 'large'
  bordered?: boolean
}

/* ═══════════════════════════════════════
   COMPOSANT DE BASE
═══════════════════════════════════════ */

export const EmptyState: React.FC<EmptyStateBaseProps> = ({
  title = 'Aucune donnée',
  description,
  icon,
  actions = [],
  className = '',
  size = 'default',
  bordered = true,
}) => {
  const sizeStyles = {
    small: { padding: '32px 24px', iconSize: 40 },
    default: { padding: '64px 40px', iconSize: 56 },
    large: { padding: '96px 40px', iconSize: 72 },
  }

  const { padding, iconSize } = sizeStyles[size]

  return (
    <div
      className={`empty-state-container ${bordered ? 'empty-state-bordered' : ''} ${className}`}
      style={{ padding }}
    >
      {icon && (
        <div className="empty-state-icon" style={{ fontSize: iconSize }}>
          {icon}
        </div>
      )}

      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        {description && (
          <p className="empty-state-description">{description}</p>
        )}
      </div>

      {actions.length > 0 && (
        <Space className="empty-state-actions" wrap>
          {actions.map((action, index) => (
            <Button
              key={index}
              type={action.type || (index === 0 ? 'primary' : 'default')}
              icon={action.icon}
              onClick={action.onClick}
              danger={action.danger}
              size="large"
            >
              {action.label}
            </Button>
          ))}
        </Space>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   ÉTATS VIDES PAR MODULE MÉTIER
═══════════════════════════════════════ */

/** Empty state pour la liste des colis */
export const EmptyColisList: React.FC<{
  onCreateClick?: () => void
  searchTerm?: string
  onClearSearch?: () => void
}> = ({ onCreateClick, searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <EmptyState
        icon={<SearchOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
        title={`Aucun colis pour "${searchTerm}"`}
        description="Essayez avec un autre numéro de référence, nom de client ou statut."
        actions={[
          ...(onClearSearch
            ? [{ label: 'Effacer la recherche', icon: <ReloadOutlined />, onClick: onClearSearch, type: 'default' as const }]
            : []),
          ...(onCreateClick
            ? [{ label: 'Nouveau colis', icon: <PlusOutlined />, onClick: onCreateClick, type: 'primary' as const }]
            : []),
        ]}
      />
    )
  }

  return (
    <EmptyState
      icon={<InboxOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
      title="Aucun colis enregistré"
      description="Commencez par créer votre premier colis. Chaque colis sera suivi de Paris jusqu'à sa destination."
      actions={
        onCreateClick
          ? [{ label: 'Créer un colis', icon: <PlusOutlined />, onClick: onCreateClick }]
          : []
      }
    />
  )
}

/** Empty state pour les factures */
export const EmptyFacturesList: React.FC<{
  onGoToColis?: () => void
  searchTerm?: string
  onClearSearch?: () => void
}> = ({ onGoToColis, searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <EmptyState
        icon={<SearchOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
        title={`Aucune facture pour "${searchTerm}"`}
        description="Vérifiez le numéro de facture ou la référence colis."
        actions={
          onClearSearch
            ? [{ label: 'Effacer la recherche', icon: <ReloadOutlined />, onClick: onClearSearch, type: 'default' as const }]
            : []
        }
      />
    )
  }

  return (
    <EmptyState
      icon={<FileTextOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
      title="Aucune facture générée"
      description="Les factures sont créées automatiquement lors de la validation d'un colis. Commencez par enregistrer et valider des colis."
      actions={
        onGoToColis
          ? [{ label: 'Voir les colis', icon: <InboxOutlined />, onClick: onGoToColis }]
          : []
      }
    />
  )
}

/** Empty state pour les paiements */
export const EmptyPaiementsList: React.FC<{
  onGoToFactures?: () => void
  searchTerm?: string
  onClearSearch?: () => void
}> = ({ onGoToFactures, searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <EmptyState
        icon={<SearchOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
        title={`Aucun paiement pour "${searchTerm}"`}
        description="Vérifiez la référence ou le nom du client."
        actions={
          onClearSearch
            ? [{ label: 'Effacer la recherche', icon: <ReloadOutlined />, onClick: onClearSearch, type: 'default' as const }]
            : []
        }
      />
    )
  }

  return (
    <EmptyState
      icon={<DollarCircleOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
      title="Aucun paiement enregistré"
      description="Les paiements s'afficheront ici une fois les factures réglées par les clients (espèces, Orange Money, Wave ou virement)."
      actions={
        onGoToFactures
          ? [{ label: 'Voir les factures', icon: <FileTextOutlined />, onClick: onGoToFactures }]
          : []
      }
    />
  )
}

/** Empty state pour les clients */
export const EmptyClientsList: React.FC<{
  onCreateClick?: () => void
  searchTerm?: string
  onClearSearch?: () => void
}> = ({ onCreateClick, searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <EmptyState
        icon={<SearchOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
        title={`Aucun client pour "${searchTerm}"`}
        description="Essayez avec le nom, téléphone ou email du client."
        actions={[
          ...(onClearSearch
            ? [{ label: 'Effacer', icon: <ReloadOutlined />, onClick: onClearSearch, type: 'default' as const }]
            : []),
          ...(onCreateClick
            ? [{ label: 'Nouveau client', icon: <PlusOutlined />, onClick: onCreateClick }]
            : []),
        ]}
      />
    )
  }

  return (
    <EmptyState
      icon={<TeamOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
      title="Aucun client enregistré"
      description="Ajoutez vos premiers clients expéditeurs pour leur associer des colis et suivre leur historique."
      actions={
        onCreateClick
          ? [{ label: 'Ajouter un client', icon: <PlusOutlined />, onClick: onCreateClick }]
          : []
      }
    />
  )
}

/** Empty state pour les utilisateurs */
export const EmptyUsersList: React.FC<{
  onCreateClick?: () => void
  searchTerm?: string
  onClearSearch?: () => void
}> = ({ onCreateClick, searchTerm, onClearSearch }) => {
  if (searchTerm) {
    return (
      <EmptyState
        icon={<SearchOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
        title={`Aucun utilisateur pour "${searchTerm}"`}
        description="Vérifiez le nom d'utilisateur, le nom complet ou l'email."
        actions={[
          ...(onClearSearch
            ? [{ label: 'Effacer', icon: <ReloadOutlined />, onClick: onClearSearch, type: 'default' as const }]
            : []),
          ...(onCreateClick
            ? [{ label: 'Créer un utilisateur', icon: <PlusOutlined />, onClick: onCreateClick }]
            : []),
        ]}
      />
    )
  }

  return (
    <EmptyState
      icon={<UserOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
      title="Aucun utilisateur enregistré"
      description="Créez des comptes utilisateurs pour votre équipe avec les rôles appropriés (opérateur, caissier, validateur…)."
      actions={
        onCreateClick
          ? [{ label: 'Créer un utilisateur', icon: <PlusOutlined />, onClick: onCreateClick }]
          : []
      }
    />
  )
}

/** Empty state pour les expéditions/manifestes */
export const EmptyExpeditionsList: React.FC<{
  onCreateClick?: () => void
}> = ({ onCreateClick }) => (
  <EmptyState
    icon={<TruckOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Aucune expédition créée"
    description="Créez des manifestes pour regrouper vos colis par conteneur et suivre les envois groupés Paris → Abidjan."
    actions={
      onCreateClick
        ? [{ label: 'Nouvelle expédition', icon: <PlusOutlined />, onClick: onCreateClick }]
        : []
    }
  />
)

/** Empty state pour la caisse (mouvements) */
export const EmptyCaisseList: React.FC<{
  onAddMouvement?: () => void
  dateRange?: string
}> = ({ onAddMouvement, dateRange }) => (
  <EmptyState
    icon={<BankOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Aucun mouvement de caisse"
    description={
      dateRange
        ? `Aucun mouvement enregistré pour la période sélectionnée (${dateRange}).`
        : "L'historique de caisse apparaîtra ici. Commencez par enregistrer vos encaissements et décaissements."
    }
    actions={
      onAddMouvement
        ? [{ label: 'Nouveau mouvement', icon: <PlusOutlined />, onClick: onAddMouvement }]
        : []
    }
  />
)

/** Empty state pour les rôles */
export const EmptyRolesList: React.FC<{
  onCreateClick?: () => void
}> = ({ onCreateClick }) => (
  <EmptyState
    icon={<SafetyCertificateOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Aucun rôle configuré"
    description="Les rôles définissent les permissions d'accès de vos utilisateurs. Configurez au minimum les rôles Administrateur, Opérateur et Caissier."
    actions={
      onCreateClick
        ? [{ label: 'Créer un rôle', icon: <PlusOutlined />, onClick: onCreateClick }]
        : []
    }
  />
)

/** Empty state pour les statistiques */
export const EmptyStatistiques: React.FC<{
  onRefresh?: () => void
  period?: string
}> = ({ onRefresh, period }) => (
  <EmptyState
    icon={<BarChartOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Pas encore de données statistiques"
    description={
      period
        ? `Aucune donnée disponible pour la période "${period}". Essayez une autre plage de dates.`
        : "Les statistiques se calculent à partir de vos colis et paiements. Enregistrez des activités pour voir les graphiques."
    }
    actions={
      onRefresh
        ? [{ label: 'Actualiser', icon: <ReloadOutlined />, onClick: onRefresh, type: 'default' as const }]
        : []
    }
  />
)

/** Empty state pour les recommandations IA */
export const EmptyRecommandations: React.FC<{
  onRefresh?: () => void
}> = ({ onRefresh }) => (
  <EmptyState
    size="small"
    bordered={false}
    icon={<BarChartOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Pas encore de recommandations"
    description="L'IA analysera vos données dès qu'il y aura suffisamment d'activité pour générer des alertes et recommandations."
    actions={
      onRefresh
        ? [{ label: 'Actualiser', icon: <ReloadOutlined />, onClick: onRefresh, type: 'default' as const }]
        : []
    }
  />
)

/** Empty state pour les produits/tarifs */
export const EmptyTarifsList: React.FC<{
  onCreateClick?: () => void
}> = ({ onCreateClick }) => (
  <EmptyState
    icon={<TagOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Aucun tarif configuré"
    description="Définissez vos grilles tarifaires par zone, poids et type de transport pour automatiser la facturation."
    actions={
      onCreateClick
        ? [{ label: 'Ajouter un tarif', icon: <PlusOutlined />, onClick: onCreateClick }]
        : []
    }
  />
)

/** Empty state pour la cartographie (aucun colis localisé) */
export const EmptyMapState: React.FC<{
  onGoToColis?: () => void
}> = ({ onGoToColis }) => (
  <EmptyState
    icon={<GlobalOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Aucun colis à afficher sur la carte"
    description="Seuls les colis avec une adresse géolocalisée apparaissent sur la carte. Assurez-vous que les destinations sont renseignées."
    actions={
      onGoToColis
        ? [{ label: 'Voir les colis', icon: <InboxOutlined />, onClick: onGoToColis }]
        : []
    }
  />
)

/** Empty state pour l'historique (retraits, produits…) */
export const EmptyHistorique: React.FC<{
  label?: string
  onRefresh?: () => void
}> = ({ label = 'historique', onRefresh }) => (
  <EmptyState
    size="small"
    icon={<HistoryOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title={`Aucun ${label} à afficher`}
    description="Aucune donnée enregistrée pour la période sélectionnée."
    actions={
      onRefresh
        ? [{ label: 'Actualiser', icon: <ReloadOutlined />, onClick: onRefresh, type: 'default' as const }]
        : []
    }
  />
)

/* ═══════════════════════════════════════
   ÉTATS SPÉCIAUX (ERREUR, RECHERCHE, OFFLINE)
═══════════════════════════════════════ */

/** Empty state pour les résultats de recherche */
export const EmptySearchState: React.FC<{
  searchTerm?: string
  onClearSearch?: () => void
  onCreateClick?: () => void
  createLabel?: string
}> = ({ searchTerm, onClearSearch, onCreateClick, createLabel = 'Créer' }) => (
  <EmptyState
    icon={<SearchOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Aucun résultat trouvé"
    description={
      searchTerm
        ? `Aucun résultat pour "${searchTerm}". Vérifiez l'orthographe ou essayez d'autres mots-clés.`
        : 'Aucun résultat ne correspond à votre recherche.'
    }
    actions={[
      ...(onClearSearch
        ? [{ label: 'Effacer la recherche', icon: <ReloadOutlined />, onClick: onClearSearch, type: 'default' as const }]
        : []),
      ...(onCreateClick
        ? [{ label: createLabel, icon: <PlusOutlined />, onClick: onCreateClick }]
        : []),
    ]}
  />
)

/** Empty state pour les erreurs de chargement */
export const EmptyErrorState: React.FC<{
  title?: string
  description?: string
  onRetry?: () => void
}> = ({
  title = 'Erreur de chargement',
  description = 'Impossible de charger les données. Vérifiez votre connexion ou contactez l\'administrateur.',
  onRetry,
}) => (
  <EmptyState
    icon={<WarningOutlined style={{ color: '#ff7875' }} />}
    title={title}
    description={description}
    className="empty-error-state"
    actions={
      onRetry
        ? [{ label: 'Réessayer', icon: <ReloadOutlined />, onClick: onRetry }]
        : []
    }
  />
)

/** Empty state hors ligne */
export const EmptyOfflineState: React.FC<{
  onRetry?: () => void
}> = ({ onRetry }) => (
  <EmptyState
    icon={<WifiOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title="Connexion indisponible"
    description="Vous semblez être hors ligne. Les données affichées peuvent ne pas être à jour."
    className="empty-offline-state"
    actions={
      onRetry
        ? [{ label: 'Réessayer la connexion', icon: <ReloadOutlined />, onClick: onRetry, type: 'default' as const }]
        : []
    }
  />
)

/** Empty state pour les paramètres non configurés */
export const EmptySettingsState: React.FC<{
  section?: string
  onConfigure?: () => void
}> = ({ section = 'cette section', onConfigure }) => (
  <EmptyState
    size="small"
    icon={<SettingOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title={`Aucune configuration pour ${section}`}
    description="Cette section n'a pas encore été paramétrée."
    actions={
      onConfigure
        ? [{ label: 'Configurer', icon: <SettingOutlined />, onClick: onConfigure, type: 'default' as const }]
        : []
    }
  />
)

/* ═══════════════════════════════════════
   LISTE GÉNÉRIQUE AVEC RECHERCHE
═══════════════════════════════════════ */

/** Empty state pour liste avec action créer */
export const EmptyListState: React.FC<{
  title?: string
  description?: string
  onCreateClick?: () => void
  createLabel?: string
  icon?: React.ReactNode
}> = ({
  title = 'Aucun élément trouvé',
  description = 'Commencez par créer votre premier élément.',
  onCreateClick,
  createLabel = 'Créer',
  icon,
}) => (
  <EmptyState
    icon={icon || <InboxOutlined style={{ color: 'var(--lbp-text-disabled, #bfbfbf)' }} />}
    title={title}
    description={description}
    actions={
      onCreateClick
        ? [{ label: createLabel, icon: <PlusOutlined />, onClick: onCreateClick }]
        : []
    }
  />
)

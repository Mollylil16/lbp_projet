import React from 'react';
import { Badge, Button, Spin, Tooltip } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useOffline } from '@hooks/useOffline';
import './OfflineIndicator.css';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, lastSyncAt, syncNow } = useOffline();

  // En ligne et rien en attente → invisible
  if (isOnline && pendingCount === 0) return null;

  const lastSyncLabel = lastSyncAt
    ? lastSyncAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      className={`offline-indicator ${isOnline ? 'offline-indicator--online' : 'offline-indicator--offline'}`}
      role={isOnline ? 'status' : 'alert'}
      aria-live={isOnline ? 'polite' : 'assertive'}
      aria-atomic="true"
      aria-label={
        isOnline
          ? `${pendingCount} action${pendingCount > 1 ? 's' : ''} en attente de synchronisation`
          : 'Mode hors ligne actif'
      }
    >
      <div className="offline-indicator__content">
        {/* Icône statut */}
        <span className="offline-indicator__icon">
          {isOnline ? (
            <WifiOutlined style={{ color: '#52c41a' }} />
          ) : (
            <DisconnectOutlined style={{ color: '#ff4d4f' }} />
          )}
        </span>

        {/* Message */}
        <span className="offline-indicator__message">
          {isOnline ? (
            pendingCount > 0 ? (
              <>
                Connexion rétablie —{' '}
                <Badge count={pendingCount} size="small" style={{ backgroundColor: '#fa8c16' }} />{' '}
                action{pendingCount > 1 ? 's' : ''} en attente de synchronisation
              </>
            ) : null
          ) : (
            <>
              <strong>Mode hors ligne</strong> — Les modifications seront synchronisées à la reconnexion
              {pendingCount > 0 && (
                <>
                  {' '}(
                  <Badge count={pendingCount} size="small" style={{ backgroundColor: '#faad14' }} />{' '}
                  en attente)
                </>
              )}
            </>
          )}
        </span>

        {/* Dernière sync */}
        {lastSyncLabel && (
          <span className="offline-indicator__last-sync">
            Dernière sync : {lastSyncLabel}
          </span>
        )}

        {/* Bouton sync manuel */}
        {isOnline && pendingCount > 0 && (
          <Tooltip title="Synchroniser maintenant">
            <Button
              size="small"
              type="text"
              icon={
                isSyncing ? (
                  <Spin indicator={<SyncOutlined spin style={{ fontSize: 14 }} />} />
                ) : (
                  <SyncOutlined />
                )
              }
              onClick={syncNow}
              disabled={isSyncing}
              className="offline-indicator__sync-btn"
            >
              {isSyncing ? 'Sync…' : 'Sync'}
            </Button>
          </Tooltip>
        )}

        {/* Succès sync */}
        {isOnline && pendingCount === 0 && lastSyncAt && (
          <span className="offline-indicator__success">
            <CheckCircleOutlined /> Tout synchronisé
          </span>
        )}
      </div>
    </div>
  );
};

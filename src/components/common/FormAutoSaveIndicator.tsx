/**
 * Indicateur de sauvegarde automatique des brouillons
 */

import React from 'react'
import { Badge, Tooltip } from 'antd'
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons'
import './FormAutoSaveIndicator.css'

interface FormAutoSaveIndicatorProps {
  hasUnsavedChanges: boolean
  lastSaved?: Date
}

export const FormAutoSaveIndicator: React.FC<FormAutoSaveIndicatorProps> = ({
  hasUnsavedChanges,
  lastSaved,
}) => {
  if (!hasUnsavedChanges) {
    return null
  }

  const formatLastSaved = (date?: Date) => {
    if (!date) return 'jamais'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (seconds < 60) {
      return `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`
    }
    if (minutes < 60) {
      return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    }
    
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="form-auto-save-indicator">
      <Tooltip
        title={
          lastSaved
            ? `Brouillon sauvegardé automatiquement ${formatLastSaved(lastSaved)}`
            : 'Modifications non sauvegardées'
        }
      >
        <Badge
          dot
          status={lastSaved ? 'success' : 'processing'}
          className="auto-save-badge"
        >
          {lastSaved ? (
            <CheckCircleOutlined className="auto-save-icon saved" />
          ) : (
            <SaveOutlined className="auto-save-icon saving" />
          )}
        </Badge>
      </Tooltip>
      <span className="auto-save-text">
        {lastSaved ? 'Brouillon sauvegardé' : 'Sauvegarde...'}
      </span>
    </div>
  )
}

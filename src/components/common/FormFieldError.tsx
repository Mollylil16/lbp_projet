/**
 * Composant pour afficher les erreurs de validation de formulaire
 * Affiche les erreurs de manière contextuelle et accessible
 */

import React from 'react'
import { Alert } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import './FormFieldError.css'

interface FormFieldErrorProps {
  error?: string
  touched?: boolean
  className?: string
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  error,
  touched,
  className = '',
}) => {
  if (!error || !touched) {
    return null
  }

  return (
    <div className={`form-field-error ${className}`}>
      <Alert
        message={error}
        type="error"
        icon={<InfoCircleOutlined />}
        showIcon
        closable={false}
        className="form-field-error-alert"
      />
    </div>
  )
}

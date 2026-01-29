/**
 * Sélecteur de langue pour changer la langue de l'application
 */

import React from 'react'
import { Select } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import './LanguageSelector.css'

const { Option } = Select

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation()

  const handleChange = (value: string) => {
    i18n.changeLanguage(value)
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('lbp_language', value)
  }

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  return (
    <Select
      value={i18n.language || 'fr'}
      onChange={handleChange}
      className="language-selector"
      suffixIcon={<GlobalOutlined />}
      size="small"
    >
      {languages.map((lang) => (
        <Option key={lang.code} value={lang.code}>
          <span className="language-option">
            <span className="language-flag">{lang.flag}</span>
            <span className="language-label">{lang.label}</span>
          </span>
        </Option>
      ))}
    </Select>
  )
}

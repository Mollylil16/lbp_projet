/**
 * Composant pour basculer entre le mode clair et sombre
 */

import React from 'react'
import { Switch, Tooltip } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from '@contexts/ThemeContext'
import './ThemeToggle.css'

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme, isDark } = useTheme()

  const label = isDark ? 'Passer en mode clair' : 'Passer en mode sombre'

  return (
    <Tooltip title={label}>
      <div
        className="theme-toggle"
        role="group"
        aria-label="Basculer le thème"
      >
        <SunOutlined
          className={`theme-icon ${!isDark ? 'active' : ''}`}
          aria-hidden="true"
        />
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined aria-hidden="true" />}
          unCheckedChildren={<SunOutlined aria-hidden="true" />}
          size="small"
          aria-label={label}
          aria-pressed={isDark}
        />
        <MoonOutlined
          className={`theme-icon ${isDark ? 'active' : ''}`}
          aria-hidden="true"
        />
      </div>
    </Tooltip>
  )
}

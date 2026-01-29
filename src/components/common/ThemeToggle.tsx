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

  return (
    <Tooltip title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
      <div className="theme-toggle">
        <SunOutlined className={`theme-icon ${!isDark ? 'active' : ''}`} />
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          size="small"
        />
        <MoonOutlined className={`theme-icon ${isDark ? 'active' : ''}`} />
      </div>
    </Tooltip>
  )
}

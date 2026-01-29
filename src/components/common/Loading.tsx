import React from 'react'
import { Spin } from 'antd'

interface LoadingProps {
  tip?: string
  size?: 'small' | 'default' | 'large'
  fullScreen?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  tip = 'Chargement...',
  size = 'large',
  fullScreen = false,
}) => {
  const style: React.CSSProperties = fullScreen
    ? {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      }

  return (
    <div style={style}>
      <Spin size={size} tip={tip} />
    </div>
  )
}

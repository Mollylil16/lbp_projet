import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'

const { Content } = Layout

export const PublicLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  )
}

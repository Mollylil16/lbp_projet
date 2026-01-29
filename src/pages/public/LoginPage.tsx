import React, { useState } from 'react'
import { Form, Input, Button, Typography, Collapse, Space } from 'antd'
import { UserOutlined, LockOutlined, InfoCircleOutlined, RocketOutlined } from '@ant-design/icons'
import { useAuth } from '@contexts/AuthContext'
import './LoginPage.css'

const { Title, Text } = Typography

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const isDevMode = import.meta.env.DEV

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true)
      await login(values)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img 
                src="/logo_lbp.png" 
                alt="Logo La Belle Porte" 
                className="login-logo-img"
              />
            </div>
            <Title level={2} className="login-title">
              Bienvenue sur LBP
            </Title>
            <Text className="login-subtitle">
              La Belle Porte - Gestion de Colis
            </Text>
          </div>

          {isDevMode && (
            <Collapse
              ghost
              className="dev-info-collapse"
              items={[
                {
                  key: '1',
                  label: (
                    <Space>
                      <InfoCircleOutlined />
                      <span>Mode développement - Identifiants de test</span>
                    </Space>
                  ),
                  children: (
                    <div className="dev-credentials">
                      <Text strong>Utilisateurs disponibles :</Text>
                      <div className="credentials-grid">
                        <div className="credential-item">
                          <Text code className="credential-username">admin</Text>
                          <Text className="credential-separator">/</Text>
                          <Text code className="credential-password">admin123</Text>
                          <Text className="credential-role">Super Admin</Text>
                        </div>
                        <div className="credential-item">
                          <Text code className="credential-username">manager</Text>
                          <Text className="credential-separator">/</Text>
                          <Text code className="credential-password">manager123</Text>
                          <Text className="credential-role">Administrateur</Text>
                        </div>
                        <div className="credential-item">
                          <Text code className="credential-username">operateur</Text>
                          <Text className="credential-separator">/</Text>
                          <Text code className="credential-password">operateur123</Text>
                          <Text className="credential-role">Opérateur</Text>
                        </div>
                        <div className="credential-item">
                          <Text code className="credential-username">caissier</Text>
                          <Text className="credential-separator">/</Text>
                          <Text code className="credential-password">caissier123</Text>
                          <Text className="credential-role">Caissier</Text>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          )}

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Veuillez saisir votre nom d'utilisateur" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Nom d'utilisateur"
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Veuillez saisir votre mot de passe' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Mot de passe"
                className="modern-input"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
                size="large"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text type="secondary" className="footer-text">
              © 2024 La Belle Porte. Tous droits réservés.
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

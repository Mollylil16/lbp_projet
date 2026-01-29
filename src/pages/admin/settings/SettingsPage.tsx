import React, { useState } from 'react'
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Upload,
  message,
  Divider,
  Space,
  Tabs,
} from 'antd'
import {
  UploadOutlined,
  SaveOutlined,
  BankOutlined,
  GlobalOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { APP_CONFIG } from '@constants/application'

const { Title } = Typography
const { TextArea } = Input

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const uploadProps: UploadProps = {
    name: 'logo',
    action: '/api/upload/logo',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} téléchargé avec succès`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} échec du téléchargement.`)
      }
    },
    accept: 'image/*',
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // TODO: Appel API pour sauvegarder la configuration
      console.log('Configuration:', values)
      message.success('Configuration enregistrée avec succès')
    } catch (error) {
      message.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>Configuration Entreprise</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          companyName: APP_CONFIG.company.name,
          shortName: APP_CONFIG.company.shortName,
          address: APP_CONFIG.company.address,
          phone: APP_CONFIG.company.phone,
          email: APP_CONFIG.company.email,
          website: APP_CONFIG.company.website,
          rccm: APP_CONFIG.company.rccm,
          nif: APP_CONFIG.company.nif,
          accountNumber: APP_CONFIG.company.accountNumber,
        }}
      >
        <Tabs defaultActiveKey="infos">
          <Tabs.TabPane
            tab={
              <span>
                <BankOutlined />
                Informations Entreprise
              </span>
            }
            key="infos"
          >
            <Card>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyName"
                    label="Nom de l'entreprise"
                    rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                  >
                    <Input size="large" placeholder="LA BELLE PORTE" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="shortName"
                    label="Nom abrégé"
                    rules={[{ required: true, message: 'Le nom abrégé est obligatoire' }]}
                  >
                    <Input size="large" placeholder="LBP" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="address"
                    label="Adresse complète"
                    rules={[{ required: true, message: 'L\'adresse est obligatoire' }]}
                  >
                    <TextArea rows={3} placeholder="Siège Social, Adresse..." />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="phone"
                    label="Téléphone"
                    rules={[{ required: true, message: 'Le téléphone est obligatoire' }]}
                  >
                    <Input size="large" placeholder="+225 XX XX XX XX XX" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'L\'email est obligatoire' },
                      { type: 'email', message: 'Email invalide' },
                    ]}
                  >
                    <Input size="large" type="email" placeholder="contact@lbp.ci" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item name="website" label="Site web">
                    <Input size="large" placeholder="https://www.lbp.ci" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <GlobalOutlined />
                Informations Légales
              </span>
            }
            key="legal"
          >
            <Card>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="rccm" label="RCCM">
                    <Input size="large" placeholder="CI-ABJ-2024-B-XXXX" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="nif" label="NIF / Numéro contribuable">
                    <Input size="large" placeholder="NIF XXXXXXX" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="accountNumber" label="Numéro de compte bancaire">
                    <Input size="large" placeholder="CI034 01022 XXXXXX 61 BACI" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <PictureOutlined />
                Logo et Apparence
              </span>
            }
            key="logo"
          >
            <Card>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Logo de l'entreprise">
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />} size="large">
                        Télécharger le logo
                      </Button>
                    </Upload>
                    <div style={{ marginTop: 8 }}>
                      <small>Formats acceptés: JPG, PNG, SVG (Max: 2MB)</small>
                    </div>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <div style={{ textAlign: 'center', padding: 20, border: '1px dashed #d9d9d9', borderRadius: 8 }}>
                    <p>Aperçu du logo</p>
                    <img
                      src="/logo-lbp.png"
                      alt="Logo"
                      style={{ maxWidth: '200px', maxHeight: '100px' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Tabs.TabPane>
        </Tabs>

        <Divider />

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={loading}
          >
            Enregistrer la Configuration
          </Button>
          <Button size="large" onClick={() => form.resetFields()}>
            Réinitialiser
          </Button>
        </Space>
      </Form>
    </div>
  )
}

import React from 'react'
import { Form, Input, Select, Button, Card, Row, Col, Space } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { APP_CONFIG } from '@constants/application'
import { ClientColis, CreateClientDto, UpdateClientDto } from '@services/clients.service'

const { Option } = Select

// Schéma de validation
const clientFormSchema = z.object({
  nom_exp: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type_piece_exp: z.string().min(1, 'Le type de pièce est obligatoire'),
  num_piece_exp: z.string().min(6, 'Le numéro de pièce doit contenir au moins 6 caractères'),
  tel_exp: z.string().min(10, 'Le téléphone est obligatoire'),
  email_exp: z.string().email('Email invalide').optional().or(z.literal('')),
})

type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientFormProps {
  onSubmit: (data: CreateClientDto | UpdateClientDto) => void | Promise<void>
  initialData?: Partial<ClientColis>
  loading?: boolean
}

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nom_exp: initialData?.nom_exp || '',
      type_piece_exp: initialData?.type_piece_exp || '',
      num_piece_exp: initialData?.num_piece_exp || '',
      tel_exp: initialData?.tel_exp || '',
      email_exp: initialData?.email_exp || '',
    },
  })

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Card>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="nom_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Nom complet de l'expéditeur"
                  required
                  validateStatus={errors.nom_exp ? 'error' : ''}
                  help={errors.nom_exp?.message}
                >
                  <Input {...field} placeholder="Nom complet" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={6}>
            <Controller
              name="type_piece_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Type de pièce d'identité"
                  required
                  validateStatus={errors.type_piece_exp ? 'error' : ''}
                  help={errors.type_piece_exp?.message}
                >
                  <Select {...field} placeholder="Type" size="large">
                    {APP_CONFIG.typesPieceIdentite.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={6}>
            <Controller
              name="num_piece_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="N° Pièce d'identité"
                  required
                  validateStatus={errors.num_piece_exp ? 'error' : ''}
                  help={errors.num_piece_exp?.message}
                >
                  <Input {...field} placeholder="N° pièce" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="tel_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Téléphone"
                  required
                  validateStatus={errors.tel_exp ? 'error' : ''}
                  help={errors.tel_exp?.message}
                >
                  <Input {...field} placeholder="+225 XX XX XX XX XX" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="email_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Email (optionnel)"
                  validateStatus={errors.email_exp ? 'error' : ''}
                  help={errors.email_exp?.message}
                >
                  <Input {...field} type="email" placeholder="email@example.com" size="large" />
                </Form.Item>
              )}
            />
          </Col>
        </Row>

        <Space style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" loading={loading}>
            Enregistrer
          </Button>
          <Button size="large">Annuler</Button>
        </Space>
      </Card>
    </Form>
  )
}

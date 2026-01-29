import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  InputNumber,
  Alert,
  Divider,
} from 'antd'
import { DollarOutlined, SaveOutlined } from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { APP_CONFIG } from '@constants/application'
import { CreatePaiementDto, RestantAPayerInfo } from '@services/paiements.service'
import { calculerMonnaieRendue, calculerRestantAPayer } from '@utils/calculations'
import { formatMontantWithDevise } from '@utils/format'
import { paiementsService } from '@services/paiements.service'
import { useQuery } from '@tanstack/react-query'

const { Title, Text } = Typography
const { Option } = Select

// Schéma de validation
const paiementFormSchema = z.object({
  montant: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  mode_paiement: z.string().min(1, 'Le mode de paiement est obligatoire'),
  date_paiement: z.string().min(1, 'La date de paiement est obligatoire'),
  reference: z.string().optional(),
})

type PaiementFormData = z.infer<typeof paiementFormSchema>

interface PaiementFormProps {
  refColis: string
  onSubmit: (data: CreatePaiementDto) => void | Promise<void>
  loading?: boolean
}

export const PaiementForm: React.FC<PaiementFormProps> = ({
  refColis,
  onSubmit,
  loading = false,
}) => {
  const [montantRecu, setMontantRecu] = useState<number>(0)
  const [monnaieRendue, setMonnaieRendue] = useState<number>(0)

  // Récupérer les informations de restant à payer
  const { data: restantInfo, isLoading: isLoadingRestant } = useQuery({
    queryKey: ['paiements', 'restant', refColis],
    queryFn: () => paiementsService.calculateRestantAPayer(refColis),
    enabled: !!refColis,
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaiementFormData>({
    resolver: zodResolver(paiementFormSchema),
    defaultValues: {
      montant: 0,
      mode_paiement: '0', // Comptant par défaut
      date_paiement: new Date().toISOString().split('T')[0],
      reference: '',
    },
  })

  const montant = watch('montant') || 0
  const modePaiement = watch('mode_paiement')
  const isComptant = modePaiement === '0'

  // Calculer la monnaie rendue si comptant
  useEffect(() => {
    if (isComptant && restantInfo && montant > 0) {
      const monnaie = calculerMonnaieRendue(restantInfo.restant_a_payer, montant)
      setMonnaieRendue(monnaie)
      setMontantRecu(montant)
    } else {
      setMonnaieRendue(0)
      setMontantRecu(0)
    }
  }, [montant, isComptant, restantInfo])

  // Initialiser le montant avec le restant à payer pour comptant
  useEffect(() => {
    if (restantInfo && isComptant && montant === 0) {
      setValue('montant', restantInfo.restant_a_payer)
    }
  }, [restantInfo, isComptant, setValue, montant])

  const onFormSubmit = (data: PaiementFormData) => {
    const submitData: CreatePaiementDto = {
      ref_colis: refColis,
      montant: data.montant,
      mode_paiement: APP_CONFIG.modesPaiement.find((m) => m.value.toString() === data.mode_paiement)?.label || 'Comptant',
      date_paiement: data.date_paiement,
      reference: data.reference,
      monnaie_rendue: isComptant ? monnaieRendue : undefined,
    }
    onSubmit(submitData)
  }

  if (isLoadingRestant) {
    return <div>Chargement...</div>
  }

  return (
    <Form layout="vertical" onFinish={handleSubmit(onFormSubmit)}>
      {/* INFORMATIONS RESTANT À PAYER */}
      {restantInfo && (
        <Card style={{ marginBottom: 16, background: '#f0f2f5' }}>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div>
                <Text type="secondary">Montant Total</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {formatMontantWithDevise(restantInfo.montant_total)}
                </Title>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Text type="secondary">Déjà Payé</Text>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                  {formatMontantWithDevise(restantInfo.montant_paye)}
                </Title>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Text type="secondary">Restant à Payer</Text>
                <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                  {formatMontantWithDevise(restantInfo.restant_a_payer)}
                </Title>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {restantInfo && restantInfo.restant_a_payer <= 0 && (
        <Alert
          message="Ce colis est entièrement payé"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="date_paiement"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Date de paiement"
                  required
                  validateStatus={errors.date_paiement ? 'error' : ''}
                  help={errors.date_paiement?.message}
                >
                  <Input {...field} type="date" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="mode_paiement"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Mode de paiement"
                  required
                  validateStatus={errors.mode_paiement ? 'error' : ''}
                  help={errors.mode_paiement?.message}
                >
                  <Select {...field} size="large">
                    {APP_CONFIG.modesPaiement.map((mode) => (
                      <Option key={mode.value} value={mode.value.toString()}>
                        {mode.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="montant"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label={isComptant ? 'Montant reçu' : 'Montant à payer'}
                  required
                  validateStatus={errors.montant ? 'error' : ''}
                  help={errors.montant?.message}
                >
                  <InputNumber
                    {...field}
                    value={field.value}
                    onChange={(value) => field.onChange(value || 0)}
                    min={0.01}
                    max={restantInfo?.restant_a_payer}
                    style={{ width: '100%' }}
                    size="large"
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  />
                  {restantInfo && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                      Maximum: {formatMontantWithDevise(restantInfo.restant_a_payer)}
                    </Text>
                  )}
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <Form.Item label="Référence (optionnel)">
                  <Input {...field} placeholder="Numéro chèque, virement, etc." size="large" />
                </Form.Item>
              )}
            />
          </Col>

          {isComptant && montantRecu > 0 && restantInfo && (
            <>
              <Col xs={24}>
                <Divider />
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ background: '#f0f2f5', padding: 16, borderRadius: 8 }}>
                  <Text type="secondary">Montant reçu</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {formatMontantWithDevise(montantRecu)}
                  </Title>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8 }}>
                  <Text type="secondary">Monnaie à rendre</Text>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    {formatMontantWithDevise(monnaieRendue)}
                  </Title>
                </div>
              </Col>
            </>
          )}
        </Row>

        <Space style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={loading}
            disabled={restantInfo?.restant_a_payer === 0}
          >
            Enregistrer le paiement
          </Button>
          <Button size="large">Annuler</Button>
        </Space>
      </Card>
    </Form>
  )
}

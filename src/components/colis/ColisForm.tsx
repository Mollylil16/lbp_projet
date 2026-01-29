import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Typography,
  InputNumber,
} from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import { APP_CONFIG } from '@constants/application'
import { calculerTotalLigneMarchandise } from '@utils/calculations'
import { formatMontantWithDevise } from '@utils/format'
import type { CreateColisDto } from '@types'

const { Title, Text } = Typography
const { Option } = Select

// Schéma de validation Zod
const marchandiseSchema = z.object({
  nom_marchandise: z.string().min(1, 'Le nom de la marchandise est obligatoire'),
  nbre_colis: z.number().min(1, 'Le nombre de colis doit être au moins 1'),
  nbre_articles: z.number().min(1, 'Le nombre d\'articles doit être au moins 1'),
  poids_total: z.number().min(0.01, 'Le poids doit être supérieur à 0'),
  prix_unit: z.number().min(0, 'Le prix unitaire doit être positif'),
  prix_emballage: z.number().min(0).optional().default(0),
  prix_assurance: z.number().min(0).optional().default(0),
  prix_agence: z.number().min(0).optional().default(0),
})

const colisFormSchema = z.object({
  trafic_envoi: z.string().min(1, 'Le trafic d\'envoi est obligatoire'),
  date_envoi: z.string().min(1, 'La date d\'envoi est obligatoire'),
  mode_envoi: z.string().min(1, 'Le mode d\'envoi est obligatoire'),
  
  // Client expéditeur
  client_colis: z.object({
    nom_exp: z.string().min(2, 'Le nom de l\'expéditeur est obligatoire'),
    type_piece_exp: z.string().min(1, 'Le type de pièce est obligatoire'),
    num_piece_exp: z.string().min(6, 'Le numéro de pièce doit contenir au moins 6 caractères'),
    tel_exp: z.string().min(10, 'Le téléphone est obligatoire'),
    email_exp: z.string().email('Email invalide').optional().or(z.literal('')),
  }),
  
  // Marchandise (au moins une ligne)
  marchandise: z.array(marchandiseSchema).min(1, 'Au moins une ligne de marchandise est requise'),
  
  // Destinataire
  nom_destinataire: z.string().min(2, 'Le nom du destinataire est obligatoire'),
  lieu_dest: z.string().min(2, 'Le lieu de destination est obligatoire'),
  tel_dest: z.string().min(10, 'Le téléphone du destinataire est obligatoire'),
  email_dest: z.string().email('Email invalide').optional().or(z.literal('')),
  
  // Récupérateur (optionnel)
  nom_recup: z.string().optional(),
  adresse_recup: z.string().optional(),
  tel_recup: z.string().optional(),
  email_recup: z.string().email('Email invalide').optional().or(z.literal('')),
})

type ColisFormData = z.infer<typeof colisFormSchema>

interface ColisFormProps {
  formeEnvoi: 'groupage' | 'autres_envoi'
  onSubmit: (data: CreateColisDto) => void | Promise<void>
  initialData?: Partial<ColisFormData>
  loading?: boolean
}

export const ColisForm: React.FC<ColisFormProps> = ({
  formeEnvoi,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const [marchandiseLines, setMarchandiseLines] = useState<number[]>([1])
  const [totalGeneral, setTotalGeneral] = useState(0)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ColisFormData>({
    resolver: zodResolver(colisFormSchema),
    defaultValues: {
      mode_envoi: formeEnvoi === 'groupage' ? 'groupage' : '',
      marchandise: [{ nom_marchandise: '', nbre_colis: 0, nbre_articles: 0, poids_total: 0, prix_unit: 0 }],
      ...initialData,
    },
  })

  // Observer les valeurs de marchandise pour calculer le total
  const marchandiseValues = watch('marchandise')

  useEffect(() => {
    if (marchandiseValues) {
      const total = marchandiseValues.reduce((sum, line) => {
        if (!line) return sum
        return (
          sum +
          calculerTotalLigneMarchandise(
            line.prix_unit || 0,
            line.nbre_colis || 0,
            line.prix_emballage || 0,
            line.prix_assurance || 0,
            line.prix_agence || 0
          )
        )
      }, 0)
      setTotalGeneral(total)
    }
  }, [marchandiseValues])

  const addMarchandiseLine = () => {
    const newIndex = Math.max(...marchandiseLines) + 1
    setMarchandiseLines([...marchandiseLines, newIndex])
    
    const currentMarchandise = watch('marchandise') || []
    setValue('marchandise', [
      ...currentMarchandise,
      { 
        nom_marchandise: '', 
        nbre_colis: 0, 
        nbre_articles: 0, 
        poids_total: 0, 
        prix_unit: 0,
        prix_emballage: 0,
        prix_assurance: 0,
        prix_agence: 0,
      },
    ])
  }

  const removeMarchandiseLine = (index: number) => {
    if (marchandiseLines.length > 1) {
      const newLines = marchandiseLines.filter((_, i) => i !== index)
      setMarchandiseLines(newLines)
      
      const currentMarchandise = watch('marchandise') || []
      const newMarchandise = currentMarchandise.filter((_, i) => i !== index)
      setValue('marchandise', newMarchandise)
    }
  }

  const onFormSubmit = (data: ColisFormData) => {
    // Ajouter forme_envoi aux données
    const submitData: CreateColisDto = {
      ...data,
      forme_envoi: formeEnvoi,
    }
    onSubmit(submitData)
  }

  const isGroupage = formeEnvoi === 'groupage'

  return (
    <Form layout="vertical" onFinish={handleSubmit(onFormSubmit)}>
      {/* SECTION 1: TRAFIC ET DATE */}
      <Card title="Informations Générales" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="trafic_envoi"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Trafic d'envoi"
                  required
                  validateStatus={errors.trafic_envoi ? 'error' : ''}
                  help={errors.trafic_envoi?.message}
                >
                  <Select {...field} placeholder="Sélectionner le trafic d'envoi" size="large">
                    {APP_CONFIG.traficEnvoi.map((trafic) => (
                      <Option key={trafic} value={trafic}>
                        {trafic}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="date_envoi"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Date d'envoi"
                  required
                  validateStatus={errors.date_envoi ? 'error' : ''}
                  help={errors.date_envoi?.message}
                >
                  <DatePicker
                    {...field}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    size="large"
                    minDate={dayjs()}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              )}
            />
          </Col>

          {!isGroupage && (
            <Col xs={24} md={12}>
              <Controller
                name="mode_envoi"
                control={control}
                render={({ field }) => (
                  <Form.Item
                    label="Mode d'envoi"
                    required
                    validateStatus={errors.mode_envoi ? 'error' : ''}
                    help={errors.mode_envoi?.message}
                  >
                    <Select {...field} placeholder="Sélectionner le mode d'envoi" size="large">
                      <Option value="DHL">DHL</Option>
                      <Option value="Colis Rapides Export">Colis Rapides Export</Option>
                      <Option value="Colis Rapides Import">Colis Rapides Import</Option>
                      <Option value="Autres">Autres</Option>
                    </Select>
                  </Form.Item>
                )}
              />
            </Col>
          )}
        </Row>
      </Card>

      {/* SECTION 2: CLIENT EXPÉDITEUR */}
      <Card title="Informations Expéditeur" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="client_colis.nom_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Nom de l'expéditeur"
                  required
                  validateStatus={errors.client_colis?.nom_exp ? 'error' : ''}
                  help={errors.client_colis?.nom_exp?.message}
                >
                  <Input {...field} placeholder="Nom complet" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={6}>
            <Controller
              name="client_colis.type_piece_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Type de pièce d'identité"
                  required
                  validateStatus={errors.client_colis?.type_piece_exp ? 'error' : ''}
                  help={errors.client_colis?.type_piece_exp?.message}
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
              name="client_colis.num_piece_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="N° Pièce d'identité"
                  required
                  validateStatus={errors.client_colis?.num_piece_exp ? 'error' : ''}
                  help={errors.client_colis?.num_piece_exp?.message}
                >
                  <Input {...field} placeholder="N° pièce" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="client_colis.tel_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Téléphone"
                  required
                  validateStatus={errors.client_colis?.tel_exp ? 'error' : ''}
                  help={errors.client_colis?.tel_exp?.message}
                >
                  <Input {...field} placeholder="+225 XX XX XX XX XX" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="client_colis.email_exp"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Email (optionnel)"
                  validateStatus={errors.client_colis?.email_exp ? 'error' : ''}
                  help={errors.client_colis?.email_exp?.message}
                >
                  <Input {...field} type="email" placeholder="email@example.com" size="large" />
                </Form.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* SECTION 3: MARCHANDISE (Dynamique) */}
      <Card
        title="Informations Marchandise"
        extra={
          <Button type="dashed" icon={<PlusOutlined />} onClick={addMarchandiseLine}>
            Ajouter une ligne
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        {marchandiseLines.map((lineIndex, index) => (
          <Card
            key={lineIndex}
            type="inner"
            title={`Colis N°${index + 1}`}
            extra={
              marchandiseLines.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeMarchandiseLine(index)}
                >
                  Supprimer
                </Button>
              )
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Controller
                  name={`marchandise.${index}.nom_marchandise`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Nom de la marchandise"
                      required
                      validateStatus={errors.marchandise?.[index]?.nom_marchandise ? 'error' : ''}
                      help={errors.marchandise?.[index]?.nom_marchandise?.message}
                    >
                      <Input {...field} placeholder="Description de la marchandise" size="large" />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={6}>
                <Controller
                  name={`marchandise.${index}.nbre_colis`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Nombre de colis"
                      required
                      validateStatus={errors.marchandise?.[index]?.nbre_colis ? 'error' : ''}
                      help={errors.marchandise?.[index]?.nbre_colis?.message}
                    >
                      <InputNumber
                        {...field}
                        value={field.value}
                        onChange={(value) => field.onChange(value || 0)}
                        min={1}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={6}>
                <Controller
                  name={`marchandise.${index}.nbre_articles`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Nombre d'articles"
                      required
                      validateStatus={errors.marchandise?.[index]?.nbre_articles ? 'error' : ''}
                      help={errors.marchandise?.[index]?.nbre_articles?.message}
                    >
                      <InputNumber
                        {...field}
                        value={field.value}
                        onChange={(value) => field.onChange(value || 0)}
                        min={1}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={6}>
                <Controller
                  name={`marchandise.${index}.poids_total`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Poids total (Kg)"
                      required
                      validateStatus={errors.marchandise?.[index]?.poids_total ? 'error' : ''}
                      help={errors.marchandise?.[index]?.poids_total?.message}
                    >
                      <InputNumber
                        {...field}
                        value={field.value}
                        onChange={(value) => field.onChange(value || 0)}
                        min={0.01}
                        step={0.01}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={6}>
                <Controller
                  name={`marchandise.${index}.prix_unit`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Prix unitaire"
                      required
                      validateStatus={errors.marchandise?.[index]?.prix_unit ? 'error' : ''}
                      help={errors.marchandise?.[index]?.prix_unit?.message}
                    >
                      <InputNumber
                        {...field}
                        value={field.value}
                        onChange={(value) => field.onChange(value || 0)}
                        min={0}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={8}>
                <Controller
                  name={`marchandise.${index}.prix_emballage`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="Prix emballage (optionnel)">
                      <InputNumber
                        {...field}
                        value={field.value || 0}
                        onChange={(value) => field.onChange(value || 0)}
                        min={0}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              <Col xs={24} sm={8}>
                <Controller
                  name={`marchandise.${index}.prix_assurance`}
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="Prix assurance (optionnel)">
                      <InputNumber
                        {...field}
                        value={field.value || 0}
                        onChange={(value) => field.onChange(value || 0)}
                        min={0}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  )}
                />
              </Col>

              {!isGroupage && (
                <Col xs={24} sm={8}>
                  <Controller
                    name={`marchandise.${index}.prix_agence`}
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Frais Compagnie/Agence (optionnel)">
                        <InputNumber
                          {...field}
                          value={field.value || 0}
                          onChange={(value) => field.onChange(value || 0)}
                          min={0}
                          style={{ width: '100%' }}
                          size="large"
                        />
                      </Form.Item>
                    )}
                  />
                </Col>
              )}

              <Col xs={24}>
                <Text strong>
                  Total ligne:{' '}
                  {formatMontantWithDevise(
                    calculerTotalLigneMarchandise(
                      watch(`marchandise.${index}.prix_unit`) || 0,
                      watch(`marchandise.${index}.nbre_colis`) || 0,
                      watch(`marchandise.${index}.prix_emballage`) || 0,
                      watch(`marchandise.${index}.prix_assurance`) || 0,
                      watch(`marchandise.${index}.prix_agence`) || 0
                    )
                  )}
                </Text>
              </Col>
            </Row>
          </Card>
        ))}

        <Divider />
        <div style={{ textAlign: 'right', paddingTop: 16 }}>
          <Title level={4}>
            Total Général: {formatMontantWithDevise(totalGeneral)}
          </Title>
        </div>
      </Card>

      {/* SECTION 4: DESTINATAIRE */}
      <Card title="Informations Destinataire" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="nom_destinataire"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Nom du destinataire"
                  required
                  validateStatus={errors.nom_destinataire ? 'error' : ''}
                  help={errors.nom_destinataire?.message}
                >
                  <Input {...field} placeholder="Nom complet" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="lieu_dest"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Lieu de destination"
                  required
                  validateStatus={errors.lieu_dest ? 'error' : ''}
                  help={errors.lieu_dest?.message}
                >
                  <Input {...field} placeholder="Ville, Pays" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="tel_dest"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Téléphone"
                  required
                  validateStatus={errors.tel_dest ? 'error' : ''}
                  help={errors.tel_dest?.message}
                >
                  <Input {...field} placeholder="+225 XX XX XX XX XX" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="email_dest"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Email (optionnel)"
                  validateStatus={errors.email_dest ? 'error' : ''}
                  help={errors.email_dest?.message}
                >
                  <Input {...field} type="email" placeholder="email@example.com" size="large" />
                </Form.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* SECTION 5: RÉCUPÉRATEUR (Optionnel) */}
      <Card title="Informations Récupérateur (Optionnel)" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Controller
              name="nom_recup"
              control={control}
              render={({ field }) => (
                <Form.Item label="Nom du récupérateur">
                  <Input {...field} placeholder="Nom complet" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="adresse_recup"
              control={control}
              render={({ field }) => (
                <Form.Item label="Adresse">
                  <Input {...field} placeholder="Adresse complète" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="tel_recup"
              control={control}
              render={({ field }) => (
                <Form.Item label="Téléphone">
                  <Input {...field} placeholder="+225 XX XX XX XX XX" size="large" />
                </Form.Item>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <Controller
              name="email_recup"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Email"
                  validateStatus={errors.email_recup ? 'error' : ''}
                  help={errors.email_recup?.message}
                >
                  <Input {...field} type="email" placeholder="email@example.com" size="large" />
                </Form.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* BOUTONS D'ACTION */}
      <Card>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" loading={loading}>
            Enregistrer
          </Button>
          <Button size="large">Annuler</Button>
        </Space>
      </Card>
    </Form>
  )
}

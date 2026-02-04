import React, { useState } from 'react'
import { Modal, Typography, Tabs } from 'antd'
import { PaiementList } from '@components/paiements/PaiementList'
import { PaiementForm } from '@components/paiements/PaiementForm'
import { CreatePaiementDto } from '@services/paiements.service'
import { useCreatePaiement } from '@hooks/usePaiements'
import { Input, Button } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { WithPermission } from '@components/common/WithPermission'
import { PERMISSIONS } from '@constants/permissions'

const { Title } = Typography

export const PaiementsListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refColis, setRefColis] = useState('')
  const [searchRef, setSearchRef] = useState('')

  const createMutation = useCreatePaiement()

  const handleEncaisser = () => {
    if (refColis) {
      setIsModalOpen(true)
    }
  }

  const handleSearchRef = () => {
    setRefColis(searchRef)
  }

  const handleSubmit = async (data: CreatePaiementDto) => {
    try {
      await createMutation.mutateAsync(data)
      setIsModalOpen(false)
      setRefColis('')
      setSearchRef('')
    } catch (error) {
      console.error('Error submitting payment:', error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setRefColis('')
  }

  const tabItems = [
    {
      key: 'list',
      label: 'Liste des Paiements',
      children: <PaiementList />,
    },
    {
      key: 'encaisser',
      label: 'Encaisser un Colis',
      children: (
          <div style={{ marginBottom: 24 }}>
            <Title level={3}>Encaisser un Paiement</Title>
            <Input.Group compact style={{ maxWidth: 500 }}>
              <Input
                placeholder="Entrer la référence du colis"
                prefix={<SearchOutlined />}
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                onPressEnter={handleSearchRef}
                size="large"
                style={{ width: 'calc(100% - 120px)' }}
              />
              <WithPermission permission={PERMISSIONS.PAIEMENTS.CREATE}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleSearchRef}
                  size="large"
                  style={{ width: 120 }}
                >
                  Rechercher
                </Button>
              </WithPermission>
            </Input.Group>
            {refColis && (
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={handleEncaisser}>
                  Encaisser le colis {refColis}
                </Button>
              </div>
            )}
          </div>

          <Modal
            title={`Encaissement - Colis ${refColis}`}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width="70%"
            style={{ top: 20 }}
          >
            {refColis && (
              <PaiementForm
                refColis={refColis}
                onSubmit={handleSubmit}
                loading={createMutation.isPending}
              />
            )}
          </Modal>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>Gestion des Paiements</Title>

      <Tabs defaultActiveKey="list" items={tabItems} />
    </div>
  )
}

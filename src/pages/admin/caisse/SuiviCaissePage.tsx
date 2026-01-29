/**
 * Page de suivi de caisse avec sections APPRO, DÉCAISSEMENT, ENTREES, RAPPORT
 */

import React from 'react'
import { Tabs, Button, Space, Card } from 'antd'
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { ApproForm } from '@components/caisse/ApproForm'
import { DecaissementForm } from '@components/caisse/DecaissementForm'
import { EntreeCaisseForm } from '@components/caisse/EntreeCaisseForm'
import { MouvementsCaisseList } from '@components/caisse/MouvementsCaisseList'
import { RapportGrandesLignes } from '@components/caisse/RapportGrandesLignes'
import { WithPermission } from '@components/common/WithPermission'
import { PERMISSIONS } from '@constants/permissions'
import { useCaisses } from '@hooks/useCaisse'

const { TabPane } = Tabs

export const SuiviCaissePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('appro')
  const [approFormVisible, setApproFormVisible] = React.useState(false)
  const [decaissementFormVisible, setDecaissementFormVisible] = React.useState(false)
  const [entreeFormVisible, setEntreeFormVisible] = React.useState(false)
  const [entreeType, setEntreeType] = React.useState<
    'ENTREE_CHEQUE' | 'ENTREE_ESPECE' | 'ENTREE_VIREMENT'
  >('ENTREE_ESPECE')
  const [refreshKey, setRefreshKey] = React.useState(0)

  const { data: caisses, isLoading: caissesLoading } = useCaisses()
  const selectedCaisse = caisses?.[0] // Pour l'instant, on prend la première caisse
  const idCaisse = selectedCaisse?.id || 1 // Fallback à 1 si pas de caisse
  const soldeActuel = selectedCaisse?.solde_actuel || 0

  const handleSuccess = () => {
    setApproFormVisible(false)
    setDecaissementFormVisible(false)
    setEntreeFormVisible(false)
    setRefreshKey((prev) => prev + 1) // Force le rechargement des listes
  }

  const handleOpenEntreeForm = (type: 'ENTREE_CHEQUE' | 'ENTREE_ESPECE' | 'ENTREE_VIREMENT') => {
    setEntreeType(type)
    setEntreeFormVisible(true)
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>
              <WalletOutlined /> Suivi Caisse
            </h1>
            {selectedCaisse && (
              <Card size="small" style={{ backgroundColor: '#f0f2f5' }}>
                <Space>
                  <strong>Caisse:</strong> {selectedCaisse.libelle}
                  <strong>Solde actuel:</strong>{' '}
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {soldeActuel.toLocaleString('fr-FR')} FCFA
                  </span>
                </Space>
              </Card>
            )}
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            {/* TAB APPRO */}
            <TabPane
              tab={
                <span>
                  <ArrowUpOutlined /> APPRO (Approvisionnement)
                </span>
              }
              key="appro"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <WithPermission permission={PERMISSIONS.CAISSE.OPERATIONS}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setApproFormVisible(true)}
                    >
                      Nouvel Approvisionnement
                    </Button>
                  </WithPermission>
                </div>

                <MouvementsCaisseList
                  key={`appro-${refreshKey}`}
                  type="APPRO"
                  idCaisse={idCaisse}
                />
              </Space>
            </TabPane>

            {/* TAB DÉCAISSEMENT */}
            <TabPane
              tab={
                <span>
                  <ArrowDownOutlined /> DÉCAISSEMENT
                </span>
              }
              key="decaissement"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <WithPermission permission={PERMISSIONS.CAISSE.OPERATIONS}>
                    <Button
                      type="primary"
                      danger
                      icon={<PlusOutlined />}
                      onClick={() => setDecaissementFormVisible(true)}
                    >
                      Nouveau Décaissement
                    </Button>
                  </WithPermission>
                </div>

                <MouvementsCaisseList
                  key={`decaissement-${refreshKey}`}
                  type="DECAISSEMENT"
                  idCaisse={idCaisse}
                />
              </Space>
            </TabPane>

            {/* TAB ENTREES */}
            <TabPane
              tab={
                <span>
                  <DollarOutlined /> ENTRÉES DE CAISSE
                </span>
              }
              key="entrees"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <WithPermission permission={PERMISSIONS.CAISSE.OPERATIONS}>
                    <Space wrap>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenEntreeForm('ENTREE_ESPECE')}
                      >
                        Entrée Espèce
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenEntreeForm('ENTREE_CHEQUE')}
                      >
                        Entrée Chèque
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenEntreeForm('ENTREE_VIREMENT')}
                      >
                        Entrée Virement
                      </Button>
                    </Space>
                  </WithPermission>
                </div>

                <Tabs size="small" type="card">
                  <TabPane tab="Espèce" key="espece">
                    <MouvementsCaisseList
                      key={`entree-espece-${refreshKey}`}
                      type="ENTREE_ESPECE"
                      idCaisse={idCaisse}
                    />
                  </TabPane>
                  <TabPane tab="Chèque" key="cheque">
                    <MouvementsCaisseList
                      key={`entree-cheque-${refreshKey}`}
                      type="ENTREE_CHEQUE"
                      idCaisse={idCaisse}
                    />
                  </TabPane>
                  <TabPane tab="Virement" key="virement">
                    <MouvementsCaisseList
                      key={`entree-virement-${refreshKey}`}
                      type="ENTREE_VIREMENT"
                      idCaisse={idCaisse}
                    />
                  </TabPane>
                </Tabs>
              </Space>
            </TabPane>

            {/* TAB RAPPORT */}
            <TabPane
              tab={
                <span>
                  <FileTextOutlined /> RAPPORT GRANDES LIGNES
                </span>
              }
              key="rapport"
            >
              <RapportGrandesLignes idCaisse={idCaisse} />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      {/* Formulaires Modaux */}
      <ApproForm
        visible={approFormVisible}
        onCancel={() => setApproFormVisible(false)}
        onSuccess={handleSuccess}
        idCaisse={idCaisse}
        soldeActuel={soldeActuel}
      />

      <DecaissementForm
        visible={decaissementFormVisible}
        onCancel={() => setDecaissementFormVisible(false)}
        onSuccess={handleSuccess}
        idCaisse={idCaisse}
        soldeActuel={soldeActuel}
      />

      <EntreeCaisseForm
        visible={entreeFormVisible}
        onCancel={() => setEntreeFormVisible(false)}
        onSuccess={handleSuccess}
        idCaisse={idCaisse}
        soldeActuel={soldeActuel}
        typeEntree={entreeType}
      />
    </div>
  )
}

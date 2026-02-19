import React, { useState, useEffect } from 'react'
import { tarifsService, Tarif } from '../../../services/tarifs.service'
import { Table, Button, Modal, Form, Input, InputNumber, Space, Card, Typography, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'

const { Title } = Typography

const TarifManagementPage: React.FC = () => {
    const [tarifs, setTarifs] = useState<Tarif[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTarif, setEditingTarif] = useState<Tarif | null>(null)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchTarifs()
    }, [])

    const fetchTarifs = async () => {
        setLoading(true)
        try {
            const data = await tarifsService.getAll()
            setTarifs(data)
        } catch (error) {
            console.error('Erreur lors du chargement des tarifs:', error)
            message.error('Impossible de charger les tarifs')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrUpdate = async (values: any) => {
        setLoading(true)
        try {
            if (editingTarif) {
                await tarifsService.update(editingTarif.id, values)
                message.success('Tarif mis à jour avec succès')
            } else {
                await tarifsService.create(values)
                message.success('Tarif créé avec succès')
            }
            setIsModalOpen(false)
            form.resetFields()
            setEditingTarif(null)
            fetchTarifs()
        } catch (error) {
            console.error('Erreur lors de l’enregistrement du tarif:', error)
            message.error('Erreur lors de l’enregistrement')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        setLoading(true)
        try {
            await tarifsService.delete(id)
            message.success('Tarif supprimé')
            fetchTarifs()
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            message.error('Impossible de supprimer le tarif')
        } finally {
            setLoading(false)
        }
    }

    const openEditModal = (tarif: Tarif) => {
        setEditingTarif(tarif)
        form.setFieldsValue(tarif)
        setIsModalOpen(true)
    }

    const columns = [
        {
            title: 'Nom du Tarif',
            dataIndex: 'nom',
            key: 'nom',
        },
        {
            title: 'Prix de Vente Conseillé',
            dataIndex: 'prix_vente_conseille',
            key: 'prix_vente_conseille',
            render: (val: number) => `${val.toLocaleString()} FCFA`,
        },
        {
            title: 'Coût Transporteur (/kg)',
            dataIndex: 'cout_transport_kg',
            key: 'cout_transport_kg',
            render: (val: number) => `${val.toLocaleString()} FCFA`,
        },
        {
            title: 'Charges Fixes Unitaires',
            dataIndex: 'charges_fixes_unit',
            key: 'charges_fixes_unit',
            render: (val: number) => `${val.toLocaleString()} FCFA`,
        },
        {
            title: 'Bénéfice Prévisionnel (/kg)',
            key: 'benefice',
            render: (_: any, record: Tarif) => {
                const benef = record.prix_vente_conseille - record.cout_transport_kg - record.charges_fixes_unit
                return <span style={{ fontWeight: 'bold', color: benef > 0 ? '#52c41a' : '#f5222d' }}>{benef.toLocaleString()} FCFA</span>
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Tarif) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                    <Popconfirm title="Supprimer ce tarif ?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2}><SettingOutlined /> Gestion des Grilles Tarifaires</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTarif(null); form.resetFields(); setIsModalOpen(true); }}>
                    Nouveau Tarif
                </Button>
            </div>

            <Card bordered={false}>
                <Table dataSource={tarifs} columns={columns} rowKey="id" loading={loading} />
            </Card>

            <Modal
                title={editingTarif ? 'Modifier le Tarif' : 'Nouveau Tarif'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
                    <Form.Item name="nom" label="Nom du Tarif" rules={[{ required: true, message: 'Le nom est obligatoire' }]}>
                        <Input placeholder="ex: Aérien Express - Chine" />
                    </Form.Item>
                    <Form.Item name="prix_vente_conseille" label="Prix de Vente Conseillé (FCFA)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="cout_transport_kg" label="Coût Transporteur par kg (FCFA)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="charges_fixes_unit" label="Charges Fixes Unitaires (FCFA)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default TarifManagementPage

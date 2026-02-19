import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Typography, Space, Divider, Radio, Input, message, Result, Spin, Descriptions, Tag } from 'antd';
import { WalletOutlined, MobileOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { paiementsLienService } from '../../services/paiementsLien.service';

const { Title, Text, Paragraph } = Typography;

export const PublicPaymentPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [lien, setLien] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [provider, setProvider] = useState<'orange_money' | 'wave'>('orange_money');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (token) {
            fetchLienDetails();
        }
    }, [token]);

    const fetchLienDetails = async () => {
        try {
            setLoading(true);
            const data = await paiementsLienService.getPublicDetails(token!);
            setLien(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lien invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!phoneNumber) {
            message.warning('Veuillez saisir votre numéro de téléphone');
            return;
        }

        try {
            setConfirming(true);
            // Simulation de callback (En production, ceci serait géré par l'agrégateur de paiement)
            await paiementsLienService.confirmPayment(token!, {
                status: 'SUCCESS',
                provider: provider,
                transaction_id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                customer_name: 'Client Online',
            });
            setSuccess(true);
            message.success('Paiement effectué avec succès !');
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Erreur lors du paiement');
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
                <Spin size="large" tip="Chargement de votre facture..." />
            </div>
        );
    }

    if (error || !lien) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
                <Result
                    status="error"
                    title="Lien Invalide"
                    subTitle={error || "Le lien de paiement que vous avez utilisé n'est plus valide."}
                    extra={[
                        <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
                            Retour à l'accueil
                        </Button>
                    ]}
                />
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
                <Result
                    status="success"
                    title="Paiement Confirmé !"
                    subTitle={`Votre paiement de ${Number(lien.montant).toLocaleString()} FCFA pour la facture ${lien.facture.num_facture} a été enregistré.`}
                    extra={[
                        <Button type="primary" key="close" onClick={() => window.close()}>
                            Fermer cette fenêtre
                        </Button>
                    ]}
                />
            </div>
        );
    }

    const { facture } = lien;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px 0' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>LBP LOGISTICS</Title>
                    <Text type="secondary">Paiement Sécurisé Mobile Money</Text>
                </div>

                <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Tag color="blue" style={{ marginBottom: '8px' }}>Détails de la facture</Tag>
                            <Title level={4} style={{ marginTop: 0 }}>Facture {facture.num_facture}</Title>
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item label="Référence Colis">{facture.colis.ref_colis}</Descriptions.Item>
                                <Descriptions.Item label="Client">{facture.colis.client.nom_exp}</Descriptions.Item>
                                <Descriptions.Item label="Montant à payer">
                                    <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                                        {Number(lien.montant).toLocaleString()} FCFA
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        <Divider />

                        <div>
                            <Tag color="orange" style={{ marginBottom: '16px' }}>Moyen de paiement</Tag>
                            <Radio.Group
                                value={provider}
                                onChange={(e: any) => setProvider(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Radio.Button value="orange_money" style={{ height: 'auto', width: '100%', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <MobileOutlined style={{ fontSize: '24px', marginRight: '16px', color: '#ff7900' }} />
                                            <div>
                                                <Text strong>Orange Money</Text><br />
                                                <Text type="secondary">Paiement via Orange Côte d'Ivoire</Text>
                                            </div>
                                        </div>
                                    </Radio.Button>
                                    <Radio.Button value="wave" style={{ height: 'auto', width: '100%', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <WalletOutlined style={{ fontSize: '24px', marginRight: '16px', color: '#1890ff' }} />
                                            <div>
                                                <Text strong>Wave</Text><br />
                                                <Text type="secondary">Paiement via l'application Wave</Text>
                                            </div>
                                        </div>
                                    </Radio.Button>
                                </Space>
                            </Radio.Group>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <Text strong>Votre numéro de téléphone :</Text>
                            <Input
                                size="large"
                                placeholder="ex: 07 00 00 00 00"
                                prefix={<MobileOutlined />}
                                value={phoneNumber}
                                onChange={(e: any) => setPhoneNumber(e.target.value)}
                                style={{ marginTop: '8px', borderRadius: '8px' }}
                            />
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<CheckCircleOutlined />}
                            onClick={handlePayment}
                            loading={confirming}
                            style={{ height: '50px', fontSize: '16px', borderRadius: '8px', marginTop: '20px', background: provider === 'orange_money' ? '#ff7900' : '#1890ff', border: 'none' }}
                        >
                            Confirmer le paiement de {Number(lien.montant).toLocaleString()} FCFA
                        </Button>

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <Space>
                                <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Transaction sécurisée par cryptage 256-bit.
                                </Text>
                            </Space>
                        </div>
                    </Space>
                </Card>
            </div>
        </div>
    );
};

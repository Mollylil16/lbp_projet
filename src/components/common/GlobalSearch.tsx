import React, { useState } from 'react';
import { Input, Modal, List, Tag, Spin } from 'antd';
import { SearchOutlined, FileTextOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { searchService } from '../../services/searchService';

interface GlobalSearchProps {
    visible: boolean;
    onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ visible, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['global-search', debouncedSearch],
        queryFn: () => searchService.search(debouncedSearch),
        enabled: debouncedSearch.length >= 2,
    });

    const handleSelect = (type: string, id: number) => {
        const routes: Record<string, string> = {
            colis: `/admin/colis/${id}`,
            facture: `/admin/factures/${id}`,
            client: `/admin/clients/${id}`,
        };
        navigate(routes[type]);
        onClose();
        setSearchTerm('');
    };

    const renderItem = (item: any, type: string) => {
        const icons: Record<string, React.ReactNode> = {
            colis: <InboxOutlined />,
            facture: <FileTextOutlined />,
            client: <UserOutlined />,
        };

        const colors: Record<string, string> = {
            colis: 'blue',
            facture: 'green',
            client: 'purple',
        };

        return (
            <List.Item
                onClick={() => handleSelect(type, item.id)}
                style={{ cursor: 'pointer', padding: '12px 16px' }}
                className="hover:bg-gray-50"
            >
                <List.Item.Meta
                    avatar={icons[type]}
                    title={
                        <div>
                            {type === 'colis' && item.ref_colis}
                            {type === 'facture' && item.num_facture}
                            {type === 'client' && item.nom_exp}
                            <Tag color={colors[type]} style={{ marginLeft: 8 }}>
                                {type}
                            </Tag>
                        </div>
                    }
                    description={
                        type === 'colis'
                            ? `Client: ${item.client?.nom_exp} - Dest: ${item.nom_dest}`
                            : type === 'facture'
                                ? `Montant: ${item.montant_ttc?.toLocaleString()} FCFA`
                                : `Tél: ${item.tel_exp}`
                    }
                />
            </List.Item>
        );
    };

    const hasResults =
        data && (data.colis?.length > 0 || data.factures?.length > 0 || data.clients?.length > 0);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SearchOutlined />
                    <span>Recherche Globale</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Input
                placeholder="Rechercher colis, factures, clients..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                autoFocus
                size="large"
                style={{ marginBottom: 16 }}
            />

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin tip="Recherche en cours..." />
                </div>
            )}

            {!isLoading && debouncedSearch.length < 2 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                    Tapez au moins 2 caractères pour rechercher
                </div>
            )}

            {!isLoading && debouncedSearch.length >= 2 && !hasResults && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                    Aucun résultat trouvé pour "{debouncedSearch}"
                </div>
            )}

            {!isLoading && hasResults && (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {data.colis && data.colis.length > 0 && (
                        <>
                            <div style={{ padding: '8px 16px', fontWeight: 500, color: '#1890ff' }}>
                                Colis ({data.colis.length})
                            </div>
                            <List
                                dataSource={data.colis}
                                renderItem={(item: any) => renderItem(item, 'colis')}
                                split={false}
                            />
                        </>
                    )}

                    {data.factures && data.factures.length > 0 && (
                        <>
                            <div style={{ padding: '8px 16px', fontWeight: 500, color: '#52c41a' }}>
                                Factures ({data.factures.length})
                            </div>
                            <List
                                dataSource={data.factures}
                                renderItem={(item: any) => renderItem(item, 'facture')}
                                split={false}
                            />
                        </>
                    )}

                    {data.clients && data.clients.length > 0 && (
                        <>
                            <div style={{ padding: '8px 16px', fontWeight: 500, color: '#722ed1' }}>
                                Clients ({data.clients.length})
                            </div>
                            <List
                                dataSource={data.clients}
                                renderItem={(item: any) => renderItem(item, 'client')}
                                split={false}
                            />
                        </>
                    )}
                </div>
            )}
        </Modal>
    );
};

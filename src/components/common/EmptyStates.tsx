import React from 'react';
import { Empty, Button } from 'antd';
import {
    InboxOutlined,
    FileTextOutlined,
    DollarOutlined,
    ShoppingOutlined,
    UserOutlined,
} from '@ant-design/icons';

interface EmptyStateProps {
    type: 'colis' | 'factures' | 'paiements' | 'clients' | 'caisse' | 'generic';
    onAction?: () => void;
    actionText?: string;
    customTitle?: string;
    customDescription?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    onAction,
    actionText,
    customTitle,
    customDescription,
}) => {
    const configs = {
        colis: {
            icon: <InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
            title: 'Aucun colis enregistré',
            description: 'Commencez par créer votre premier colis pour démarrer',
            action: 'Créer un colis',
        },
        factures: {
            icon: <FileTextOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
            title: 'Aucune facture générée',
            description: 'Les factures apparaîtront ici après la création de colis',
            action: 'Voir les colis',
        },
        paiements: {
            icon: <DollarOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
            title: 'Aucun paiement enregistré',
            description: 'Les paiements seront affichés ici une fois enregistrés',
            action: 'Enregistrer un paiement',
        },
        clients: {
            icon: <UserOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
            title: 'Aucun client trouvé',
            description: 'Ajoutez des clients pour gérer vos expéditions',
            action: 'Ajouter un client',
        },
        caisse: {
            icon: <ShoppingOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
            title: 'Aucun mouvement de caisse',
            description: 'L\'historique des mouvements apparaîtra ici',
            action: 'Nouveau mouvement',
        },
        generic: {
            icon: <InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
            title: 'Aucune donnée disponible',
            description: 'Aucun élément à afficher pour le moment',
            action: 'Actualiser',
        },
    };

    const config = configs[type];

    return (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            {config.icon}
            <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 500, color: '#262626' }}>
                {customTitle || config.title}
            </h3>
            <p style={{ marginTop: 8, fontSize: 14, color: '#8c8c8c' }}>
                {customDescription || config.description}
            </p>
            {onAction && (
                <Button type="primary" onClick={onAction} style={{ marginTop: 16 }}>
                    {actionText || config.action}
                </Button>
            )}
        </div>
    );
};

export const SearchEmptyState: React.FC<{ searchTerm: string; onClear?: () => void }> = ({
    searchTerm,
    onClear,
}) => {
    return (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <span>
                    Aucun résultat pour <strong>"{searchTerm}"</strong>
                </span>
            }
        >
            {onClear && (
                <Button type="link" onClick={onClear}>
                    Effacer la recherche
                </Button>
            )}
        </Empty>
    );
};

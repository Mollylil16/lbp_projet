import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmDeleteProps {
    title: string;
    content: string;
    onConfirm: () => void | Promise<void>;
    okText?: string;
    cancelText?: string;
}

export const confirmDelete = ({
    title,
    content,
    onConfirm,
    okText = 'Oui, supprimer',
    cancelText = 'Annuler',
}: ConfirmDeleteProps) => {
    Modal.confirm({
        title,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        content,
        okText,
        okType: 'danger',
        cancelText,
        onOk: async () => {
            await onConfirm();
        },
        centered: true,
    });
};

interface ConfirmActionProps {
    title: string;
    content: string;
    onConfirm: () => void | Promise<void>;
    okText?: string;
    cancelText?: string;
    type?: 'warning' | 'info' | 'success';
}

export const confirmAction = ({
    title,
    content,
    onConfirm,
    okText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning',
}: ConfirmActionProps) => {
    const colors = {
        warning: '#faad14',
        info: '#1890ff',
        success: '#52c41a',
    };

    Modal.confirm({
        title,
        icon: <ExclamationCircleOutlined style={{ color: colors[type] }} />,
        content,
        okText,
        cancelText,
        onOk: async () => {
            await onConfirm();
        },
        centered: true,
    });
};

export const confirmValidation = (itemName: string, onConfirm: () => void | Promise<void>) => {
    confirmAction({
        title: 'Confirmer la validation',
        content: `Êtes-vous sûr de vouloir valider ${itemName} ? Cette action est irréversible.`,
        onConfirm,
        okText: 'Oui, valider',
        type: 'info',
    });
};

export const confirmCancellation = (itemName: string, onConfirm: () => void | Promise<void>) => {
    confirmAction({
        title: 'Confirmer l\'annulation',
        content: `Êtes-vous sûr de vouloir annuler ${itemName} ?`,
        onConfirm,
        okText: 'Oui, annuler',
        type: 'warning',
    });
};

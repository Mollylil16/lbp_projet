import React, { Suspense } from 'react';
import { Spin } from 'antd';

interface SuspenseWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Wrapper Suspense avec fallback par défaut
 */
export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
    children,
    fallback = (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
            }}
        >
            <Spin size="large" tip="Chargement..." />
        </div>
    ),
}) => {
    return <Suspense fallback={fallback}>{children}</Suspense>;
};

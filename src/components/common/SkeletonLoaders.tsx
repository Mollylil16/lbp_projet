import React from 'react';
import { Card, Skeleton, Table } from 'antd';

export const ColisListSkeleton: React.FC = () => {
    const columns = [
        { title: 'Référence', dataIndex: 'ref', key: 'ref' },
        { title: 'Client', dataIndex: 'client', key: 'client' },
        { title: 'Destination', dataIndex: 'dest', key: 'dest' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Statut', dataIndex: 'statut', key: 'statut' },
    ];

    const data = Array.from({ length: 5 }, (_, i) => ({ key: i }));

    return (
        <Card>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                loading={{
                    spinning: true,
                    indicator: <Skeleton active paragraph={{ rows: 5 }} />,
                }}
            />
        </Card>
    );
};

export const FactureListSkeleton: React.FC = () => {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
                <Card key={i}>
                    <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
            ))}
        </div>
    );
};

export const DetailsSkeleton: React.FC = () => {
    return (
        <Card>
            <Skeleton active avatar paragraph={{ rows: 6 }} />
            <div style={{ marginTop: 24 }}>
                <Skeleton active paragraph={{ rows: 4 }} />
            </div>
        </Card>
    );
};

export const FormSkeleton: React.FC = () => {
    return (
        <Card>
            <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
    );
};

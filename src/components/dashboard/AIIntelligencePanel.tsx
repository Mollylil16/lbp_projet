import React from 'react'
import { Card, List, Typography, Button, Tag, Space, Alert, Empty, Skeleton } from 'antd'
import {
    RobotOutlined,
    ArrowRightOutlined,
    AlertOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    BulbOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface AIRecommendation {
    type: 'error' | 'warning' | 'success' | 'info'
    title: string
    description: string
    cause?: string
    action: string
}

interface AIIntelligencePanelProps {
    recommendations: AIRecommendation[]
    loading?: boolean
}

export const AIIntelligencePanel: React.FC<AIIntelligencePanelProps> = ({
    recommendations,
    loading
}) => {
    if (loading) {
        return (
            <Card title={<Space><RobotOutlined /> Intelligence IA</Space>}>
                <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Card>
        )
    }

    return (
        <Card
            title={
                <Space>
                    <RobotOutlined style={{ color: '#1890ff' }} />
                    <span>Analyses & Recommandations IA</span>
                </Space>
            }
            className="ai-intelligence-panel"
            bodyStyle={{ padding: '0 24px 24px' }}
        >
            {recommendations.length === 0 ? (
                <Empty description="Aucune recommandation pour le moment" style={{ padding: '20px' }} />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={recommendations}
                    renderItem={(item: AIRecommendation) => (
                        <List.Item className="ai-reco-item">
                            <Alert
                                message={
                                    <Space>
                                        <Title level={5} style={{ margin: 0, color: 'inherit' }}>{item.title}</Title>
                                        <Tag color={item.type === 'error' ? 'red' : item.type === 'warning' ? 'orange' : 'blue'}>
                                            {item.type.toUpperCase()}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <div style={{ marginTop: 10 }}>
                                        <Paragraph strong>{item.description}</Paragraph>

                                        {item.cause && (
                                            <div style={{ marginBottom: 16 }}>
                                                <Text type="secondary"><InfoCircleOutlined /> Cause identifiée :</Text>
                                                <Paragraph style={{ marginTop: 4 }}>{item.cause}</Paragraph>
                                            </div>
                                        )}

                                        <div style={{ backgroundColor: '#f6ffed', padding: '12px', border: '1px border #b7eb8f', borderRadius: '4px' }}>
                                            <Text strong style={{ color: '#389e0d' }}><BulbOutlined /> Action recommandée :</Text>
                                            <Paragraph style={{ marginTop: 4, marginBottom: 8 }}>{item.action}</Paragraph>
                                            <Button type="primary" size="small" icon={<ArrowRightOutlined />}>
                                                Appliquer maintenant
                                            </Button>
                                        </div>
                                    </div>
                                }
                                type={item.type}
                                showIcon
                                icon={item.type === 'error' ? <AlertOutlined /> : item.type === 'success' ? <CheckCircleOutlined /> : <RobotOutlined />}
                                style={{ marginBottom: 16, border: 'none' }}
                            />
                        </List.Item>
                    )}
                />
            )}
        </Card>
    )
}

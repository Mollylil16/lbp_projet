import React, { useState } from 'react'
import { Card, Typography, Space, Tag, Input, Select, Empty, Descriptions } from 'antd'
import { GlobalOutlined, SearchOutlined, FilterOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useColisList } from '@hooks/useColis'
import { Colis } from '@types'

// Fix Leaflet marker icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Title, Text } = Typography

// Mock geocoding - Mapping cities to coordinates
const CITY_COORDS: Record<string, [number, number]> = {
    'Abidjan': [5.36, -4.0083],
    'Paris': [48.8566, 2.3522],
    'Dakar': [14.7167, -17.4677],
    'Cotonou': [6.3667, 2.4333],
    'Lomé': [6.1375, 1.2125],
    'Ouagadougou': [12.3714, -1.5197],
    'Bamako': [12.6392, -8.0029],
}

export const ColisMapView: React.FC = () => {
    const [envoiType, setEnvoiType] = useState<'groupage' | 'autres_envoi'>('groupage')
    const { data: colisResponse } = useColisList(envoiType, { page: 1, limit: 100 })
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<number | null>(null)

    // State to store dynamically fetched coordinates
    const [dynamicCoords, setDynamicCoords] = useState<Record<string, [number, number]>>({})

    const allColis = colisResponse?.data || []

    const filteredColis = allColis.filter((c: Colis) => {
        const matchesSearch = c.ref_colis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nom_destinataire.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === null || c.etat_validation === statusFilter
        return matchesSearch && matchesStatus
    })

    // Fetch coordinates for locations not in CITY_COORDS
    React.useEffect(() => {
        const locationsToFetch = new Set<string>();
        filteredColis.forEach((c: Colis) => {
            if (c.lieu_dest && !CITY_COORDS[c.lieu_dest] && !dynamicCoords[c.lieu_dest]) {
                locationsToFetch.add(c.lieu_dest);
            }
        });

        locationsToFetch.forEach(async (location) => {
            try {
                // Using Nominatim (OpenStreetMap public API)
                // Note: In production, you should have your own tile server or cache heavily
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setDynamicCoords(prev => ({
                        ...prev,
                        [location]: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
                    }));
                }
            } catch (error) {
                console.error(`Error geocoding ${location}:`, error);
            }
        });
    }, [filteredColis, dynamicCoords]);

    // Get marker color based on status
    const getMarkerIcon = (status: number) => {
        const color = status === 1 ? 'green' : 'blue'
        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>
                    <Space><GlobalOutlined /> Cartographie en temps réel</Space>
                </Title>
                <Space>
                    <Space>
                        <Select
                            value={envoiType}
                            style={{ width: 150 }}
                            onChange={(value: 'groupage' | 'autres_envoi') => setEnvoiType(value)}
                        >
                            <Select.Option value="groupage">Groupage</Select.Option>
                            <Select.Option value="autres_envoi">Autres Envois</Select.Option>
                        </Select>
                        <Input
                            placeholder="Rechercher un colis..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            style={{ width: 250 }}
                        />
                        <Select
                            placeholder="Statut"
                            style={{ width: 150 }}
                            allowClear
                            onChange={(value: number | undefined) => setStatusFilter(value === undefined ? null : value)}
                        >
                            <Select.Option value={0}>Brouillon</Select.Option>
                            <Select.Option value={1}>Validé</Select.Option>
                        </Select>
                    </Space>
                </Space>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, height: 'calc(100vh - 200px)' }}>
                <Card bodyStyle={{ padding: 0, height: '100%' }} style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                    <MapContainer center={[5.36, -4.0083]} zoom={4} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {filteredColis.map((c: Colis) => {
                            // Resolve coordinates: Static > Dynamic > Default (Abidjan)
                            const coords = CITY_COORDS[c.lieu_dest || ''] || dynamicCoords[c.lieu_dest || ''] || [5.36, -4.0083]
                            // Validate coords to avoid crashes
                            if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;

                            return (
                                <Marker key={c.id} position={coords as [number, number]} icon={getMarkerIcon(c.etat_validation || 0)}>
                                    <Popup>
                                        <div style={{ minWidth: 200 }}>
                                            <div style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 5 }}>
                                                <Text strong style={{ fontSize: 16 }}>{c.ref_colis}</Text>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text type="secondary">Destinataire:</Text>
                                                    <Text strong>{c.nom_destinataire}</Text>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text type="secondary">Lieu:</Text>
                                                    <Text>{c.lieu_dest}</Text>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                                                    <Tag color={c.etat_validation === 1 ? 'green' : 'blue'}>
                                                        {c.etat_validation === 1 ? 'Validé' : 'Brouillon'}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}
                    </MapContainer>
                </Card>

                <Card title={<Space><EnvironmentOutlined /><span>Liste des colis ({filteredColis.length})</span></Space>} style={{ borderRadius: 12, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filteredColis.map((c: Colis) => (
                            <Card
                                key={c.id}
                                bodyStyle={{ padding: 12 }}
                                hoverable
                                style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text strong>{c.ref_colis}</Text>
                                    <Tag color={c.etat_validation === 1 ? 'green' : 'blue'}>
                                        {c.etat_validation === 1 ? 'Validé' : 'Brouillon'}
                                    </Tag>
                                </div>
                                <div style={{ fontSize: 13, color: '#666' }}>
                                    <Space direction="vertical" size={2}>
                                        <Space>
                                            <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                            <Text>{c.lieu_dest || 'Non défini'}</Text>
                                        </Space>
                                        <Space>
                                            <TeamOutlined style={{ color: '#52c41a' }} />
                                            <Text type="secondary">{c.nom_destinataire}</Text>
                                        </Space>
                                    </Space>
                                </div>
                            </Card>
                        ))}
                        {filteredColis.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun colis trouvé" />}
                    </div>
                </Card>
            </div>
        </div>
    )
}

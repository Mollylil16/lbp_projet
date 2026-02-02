import React from "react";
import { Row, Col } from "antd";
import {
  InboxOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { DashboardStats } from "@/types";
import { formatMontantWithDevise } from "@utils/format";
import { WithPermission } from "@components/common/WithPermission";
import { PERMISSIONS } from "@constants/permissions";
import "./StatsCards.css";

import { useNavigate } from "react-router-dom";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  iconBg,
  onClick,
  trend,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="stat-card-skeleton">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-content">
        <div className={`stat-icon-wrapper ${iconBg}`}>
          {icon}
        </div>
        <div className="stat-info">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
          {trend && (
            <div
              className={`stat-trend ${trend.isPositive ? "positive" : "negative"
                }`}
            >
              <RiseOutlined className="trend-icon" />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="stats-cards-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Colis aujourd'hui"
            value={stats.colis_aujourdhui}
            icon={<InboxOutlined />}
            gradient=""
            iconBg="primary"
            loading={loading}
            onClick={() => navigate('/colis/groupage')}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="En Transit"
            value={stats.colis_en_transit}
            icon={<ClockCircleOutlined />}
            gradient=""
            iconBg="warning"
            loading={loading}
            onClick={() => navigate('/colis/autres-envois')}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Colis Livrés"
            value={stats.colis_livres}
            icon={<CheckCircleOutlined />}
            gradient=""
            iconBg="success"
            loading={loading}
            onClick={() => navigate('/colis/groupage')}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Clients Actifs"
            value={stats.clients_actifs}
            icon={<TeamOutlined />}
            gradient=""
            iconBg="info"
            loading={loading}
            onClick={() => navigate('/clients')}
          />
        </Col>
      </Row>

      <WithPermission permission={PERMISSIONS.DASHBOARD.ADMIN}>
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Revenus du jour"
              value={formatMontantWithDevise(stats.revenus_jour)}
              icon={<DollarOutlined />}
              gradient=""
              iconBg="success"
              loading={loading}
              onClick={() => navigate('/factures')}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Revenus du mois"
              value={formatMontantWithDevise(stats.revenus_mois)}
              icon={<RiseOutlined />}
              gradient=""
              iconBg="primary"
              loading={loading}
              onClick={() => navigate('/factures')}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="À Valider"
              value={stats.factures_a_valider}
              icon={<FileTextOutlined />}
              gradient=""
              iconBg="warning"
              loading={loading}
              onClick={() => navigate('/factures')}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="En attente"
              value={stats.paiements_attente}
              icon={<DollarOutlined />}
              gradient=""
              iconBg="warning"
              loading={loading}
              onClick={() => navigate('/paiements')}
            />
          </Col>
        </Row>
      </WithPermission>
    </div>
  );
};

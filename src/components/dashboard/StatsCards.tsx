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
    <div className="stat-card">
      <div className="stat-card-content" style={{ background: gradient }}>
        <div className="stat-icon-wrapper" style={{ background: iconBg }}>
          {icon}
        </div>
        <div className="stat-info">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {trend && (
            <div
              className={`stat-trend ${
                trend.isPositive ? "positive" : "negative"
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
  return (
    <div className="stats-cards-container">
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Colis créés aujourd'hui"
            value={stats.colis_aujourdhui}
            icon={<InboxOutlined />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            iconBg="rgba(102, 126, 234, 0.2)"
            loading={loading}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Colis en transit"
            value={stats.colis_en_transit}
            icon={<ClockCircleOutlined />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            iconBg="rgba(245, 158, 11, 0.2)"
            loading={loading}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Colis livrés"
            value={stats.colis_livres}
            icon={<CheckCircleOutlined />}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            iconBg="rgba(16, 185, 129, 0.2)"
            loading={loading}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Clients actifs"
            value={stats.clients_actifs}
            icon={<TeamOutlined />}
            gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            iconBg="rgba(139, 92, 246, 0.2)"
            loading={loading}
          />
        </Col>
      </Row>

      <WithPermission permission={PERMISSIONS.DASHBOARD.ADMIN}>
        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Revenus du jour"
              value={formatMontantWithDevise(stats.revenus_jour)}
              icon={<DollarOutlined />}
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              iconBg="rgba(16, 185, 129, 0.2)"
              loading={loading}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Revenus du mois"
              value={formatMontantWithDevise(stats.revenus_mois)}
              icon={<RiseOutlined />}
              gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              iconBg="rgba(59, 130, 246, 0.2)"
              loading={loading}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Factures à valider"
              value={stats.factures_a_valider}
              icon={<FileTextOutlined />}
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              iconBg="rgba(245, 158, 11, 0.2)"
              loading={loading}
            />
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Paiements en attente"
              value={stats.paiements_attente}
              icon={<DollarOutlined />}
              gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              iconBg="rgba(239, 68, 68, 0.2)"
              loading={loading}
            />
          </Col>
        </Row>
      </WithPermission>
    </div>
  );
};

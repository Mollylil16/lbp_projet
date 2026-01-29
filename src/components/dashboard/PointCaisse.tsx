import React, { useState } from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { PointCaisse as PointCaisseType } from "@/types";
import { formatMontantWithDevise } from "@utils/format";
import { PointCaisseModal } from "./PointCaisseModal";
import "./PointCaisse.css";

const { Title } = Typography;

interface PointCaisseProps {
  data: PointCaisseType;
  loading?: boolean;
  mouvements?: any[];
}

export const PointCaisse: React.FC<PointCaisseProps> = ({
  data,
  loading = false,
  mouvements = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (loading) {
    return (
      <Card className="modern-chart-card">
        <Title level={4} className="chart-title">
          Point Caisse du Jour
        </Title>
        <div className="chart-loading">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const solde = data.entrees - data.sorties;

  return (
    <>
      <Card
        className="modern-chart-card point-caisse-card"
        style={{ cursor: "pointer" }}
        onClick={() => setModalVisible(true)}
        hoverable
      >
        <div className="chart-header">
          <Title level={4} className="chart-title">
            Point Caisse du Jour
          </Title>
          <div className="point-caisse-date">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <Row gutter={[20, 20]} className="point-caisse-grid">
          <Col xs={24} sm={8}>
            <div className="point-caisse-item entree">
              <div className="point-caisse-icon">
                <ArrowUpOutlined />
              </div>
              <div className="point-caisse-content">
                <div className="point-caisse-label">Entrées</div>
                <div className="point-caisse-value">
                  {formatMontantWithDevise(data.entrees)}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="point-caisse-item sortie">
              <div className="point-caisse-icon">
                <ArrowDownOutlined />
              </div>
              <div className="point-caisse-content">
                <div className="point-caisse-label">Sorties</div>
                <div className="point-caisse-value">
                  {formatMontantWithDevise(data.sorties)}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="point-caisse-item solde">
              <div className="point-caisse-icon">
                <DollarOutlined />
              </div>
              <div className="point-caisse-content">
                <div className="point-caisse-label">Solde</div>
                <div className="point-caisse-value">
                  {formatMontantWithDevise(solde)}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <PointCaisseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
        mouvements={mouvements}
      />
    </>
  );
};

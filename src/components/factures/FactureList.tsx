import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  Tooltip,
  Card,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  PrinterOutlined,
  GlobalOutlined,
  CopyOutlined,
  WhatsAppOutlined,
  LinkOutlined
} from "@ant-design/icons";
import { Modal, Typography as AntdTypography } from "antd";
import { paiementsLienService } from "@services/paiementsLien.service";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { FactureColis } from "@types";
import {
  formatDate,
  formatMontantWithDevise,
  formatRefColis,
} from "@utils/format";
import { facturesService } from "@services/factures.service";
import { useQuery } from "@tanstack/react-query";
import { PaginationParams } from "@types";
import { WithPermission } from "@components/common/WithPermission";
import { PERMISSIONS } from "@constants/permissions";
import toast from "react-hot-toast";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface FactureListProps {
  type?: "proforma" | "definitive";
  onView?: (facture: FactureColis) => void;
}

export const FactureList: React.FC<FactureListProps> = ({ type, onView }) => {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "proforma" | "definitive" | undefined
  >(type);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [currentFacture, setCurrentFacture] = useState<FactureColis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["factures", typeFilter, pagination, searchTerm],
    queryFn: () => facturesService.getFactures(typeFilter, pagination),
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      page: newPagination.current || 1,
      limit: newPagination.pageSize || 20,
    });
  };

  const handlePrint = async (facture: FactureColis) => {
    try {
      await facturesService.printFacture(facture.id);
    } catch (error) {
      toast.error("Erreur lors de l'impression");
    }
  };

  const handleDownload = async (facture: FactureColis) => {
    try {
      await facturesService.downloadPDF(facture.id);
      toast.success("Facture téléchargée avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await facturesService.validateFacture(id);
      toast.success("Facture validée avec succès");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la validation");
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await facturesService.cancelFacture(id);
      toast.success("Facture annulée");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleGenerateLink = async (facture: FactureColis) => {
    try {
      setIsGenerating(true);
      setCurrentFacture(facture);
      const data = await paiementsLienService.generateLink(facture.id);
      const publicUrl = `${window.location.origin}/pay/${data.token}`;
      setGeneratedLink(publicUrl);
      setIsLinkModalVisible(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la génération du lien");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Lien copié dans le presse-papier");
  };

  const shareViaWhatsApp = () => {
    const message = `Bonjour, voici le lien de paiement pour votre facture ${currentFacture?.num_fact_colis} : ${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const columns: ColumnsType<FactureColis> = [
    {
      title: "N° Facture",
      dataIndex: "num_fact_colis",
      key: "num_fact_colis",
      fixed: "left",
      width: 150,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: "bold" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Référence Colis",
      dataIndex: "ref_colis",
      key: "ref_colis",
      width: 150,
      render: (text: string) => formatRefColis(text),
    },
    {
      title: "Date",
      dataIndex: "date_fact",
      key: "date_fact",
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true,
    },
    {
      title: "Montant TTC",
      dataIndex: "total_mont_ttc",
      key: "total_mont_ttc",
      width: 150,
      render: (montant: number) => formatMontantWithDevise(montant),
      sorter: true,
    },
    {
      title: "Statut",
      key: "etat",
      width: 120,
      render: (_: any, record: FactureColis) => (
        <Tag color={record.etat === 1 ? "success" : "warning"}>
          {record.etat === 1 ? "Validée" : "Proforma"}
        </Tag>
      ),
      filters: [
        { text: "Validée", value: 1 },
        { text: "Proforma", value: 0 },
      ],
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_: any, record: FactureColis) => (
        <Space size="small">
          {onView && (
            <Tooltip title="Voir détails">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
              />
            </Tooltip>
          )}

          <Tooltip title="Imprimer">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>

          <Tooltip title="Télécharger PDF">
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>

          <Tooltip title="Lien Paiement Mobile Money">
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={() => handleGenerateLink(record)}
              loading={isGenerating && currentFacture?.id === record.id}
              style={{ color: '#ff7900' }}
            />
          </Tooltip>

          {record.etat === 0 && (
            <WithPermission permission={PERMISSIONS.FACTURES.VALIDATE}>
              <Tooltip title="Valider">
                <Popconfirm
                  title="Valider cette facture proforma ?"
                  onConfirm={() => handleValidate(record.id)}
                  okText="Oui"
                  cancelText="Non"
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </WithPermission>
          )}

          {record.etat === 0 && (
            <WithPermission permission={PERMISSIONS.FACTURES.CANCEL}>
              <Popconfirm
                title="Annuler cette facture ?"
                onConfirm={() => handleCancel(record.id)}
                okText="Oui"
                cancelText="Non"
              >
                <Tooltip title="Annuler">
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </WithPermission>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* BARRE DE FILTRES ET RECHERCHE */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Rechercher par numéro facture, référence colis..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchTerm}
              onChange={(e: any) => handleSearch(e.target.value)}
              onPressEnter={(e: any) => handleSearch(e.currentTarget.value)}
              size="large"
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Type de facture"
              allowClear
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="proforma">Proforma</Option>
              <Option value="definitive">Définitive</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              size="large"
              value={dateRange}
              onChange={(dates: any) =>
                setDateRange(dates as [Dayjs | null, Dayjs | null])
              }
              format="DD/MM/YYYY"
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              size="large"
            >
              Actualiser
            </Button>
          </Col>
        </Row>
      </Card>

      {/* TABLEAU */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: data?.total || 0,
            showSizeChanger: true,
            showTotal: (total: number) => `Total: ${total} factures`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* MODAL LIEN DE PAIEMENT */}
      <Modal
        title="Lien de Paiement Mobile Money"
        open={isLinkModalVisible}
        onCancel={() => setIsLinkModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsLinkModalVisible(false)}>
            Fermer
          </Button>,
          <Button
            key="whatsapp"
            type="primary"
            icon={<WhatsAppOutlined />}
            onClick={shareViaWhatsApp}
            style={{ background: "#25D366", borderColor: "#25D366" }}
          >
            WhatsApp
          </Button>,
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={copyToClipboard}
          >
            Copier le lien
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <AntdTypography.Text type="secondary">
            Partagez ce lien avec votre client pour qu'il puisse payer via
            Orange Money ou Wave.
          </AntdTypography.Text>
          <Input
            value={generatedLink}
            readOnly
            addonBefore={<GlobalOutlined />}
            size="large"
          />
          <Card size="small" style={{ background: "#f5f5f5" }}>
            <AntdTypography.Paragraph style={{ marginBottom: 0 }}>
              <strong>Facture:</strong> {currentFacture?.num_fact_colis}
              <br />
              <strong>Montant:</strong>{" "}
              {currentFacture ? formatMontantWithDevise(currentFacture.total_mont_ttc) : ""}
            </AntdTypography.Paragraph>
          </Card>
        </Space>
      </Modal>
    </div>
  );
};

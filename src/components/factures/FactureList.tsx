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
} from "@ant-design/icons";
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
      render: (_, record) => (
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
      render: (_, record) => (
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
              onChange={(e) => handleSearch(e.target.value)}
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
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
              onChange={(dates) =>
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
            showTotal: (total) => `Total: ${total} factures`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

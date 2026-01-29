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
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Colis } from "@types";
import {
  formatDate,
  formatMontantWithDevise,
  formatRefColis,
} from "@utils/format";
import {
  useColisList,
  useDeleteColis,
  useValidateColis,
} from "@hooks/useColis";
import { WithPermission } from "@components/common/WithPermission";
import { PERMISSIONS } from "@constants/permissions";
import { TableSkeleton } from "@components/common/SkeletonLoader";
import {
  EmptyListState,
  EmptySearchState,
} from "@components/common/EmptyState";
import { exportTableToPDF, exportTableToExcel } from "@utils/export";
import { message } from "antd";
import { useTranslation } from "@hooks/useTranslation";

// Helper pour obtenir les bonnes permissions selon le type d'envoi
const getPermissions = (formeEnvoi: "groupage" | "autres_envoi") => {
  return formeEnvoi === "groupage"
    ? PERMISSIONS.COLIS_GROUPAGE
    : PERMISSIONS.COLIS_AUTRES_ENVOIS;
};
import { usePermissions } from "@contexts/PermissionsContext";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ColisListProps {
  formeEnvoi: "groupage" | "autres_envoi";
  onEdit?: (colis: Colis) => void;
  onView?: (colis: Colis) => void;
  onCreate?: () => void;
}

export const ColisList: React.FC<ColisListProps> = ({
  formeEnvoi,
  onEdit,
  onView,
  onCreate,
}) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [searchTerm, setSearchTerm] = useState("");
  const [traficFilter, setTraficFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [exporting, setExporting] = useState(false);

  const { hasPermission } = usePermissions();
  const { t } = useTranslation("colis");
  const { t: tCommon } = useTranslation("common");
  const colisPermissions = getPermissions(formeEnvoi);
  const { data, isLoading, refetch } = useColisList(formeEnvoi, {
    ...pagination,
    search: searchTerm || undefined,
  });

  const deleteMutation = useDeleteColis();
  const validateMutation = useValidateColis();

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

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  const handleExportPDF = () => {
    try {
      setExporting(true);
      if (!data?.data || data.data.length === 0) {
        message.warning("Aucune donnée à exporter");
        return;
      }

      const exportData = {
        headers: [
          "Référence",
          "Date Envoi",
          "Trafic",
          "Expéditeur",
          "Destinataire",
          "Marchandise",
          "Poids (Kg)",
          "Montant Total",
        ],
        rows: data.data.map((colis) => [
          formatRefColis(colis.ref_colis),
          formatDate(colis.date_envoi),
          colis.trafic_envoi || "-",
          colis.client_colis?.nom_exp || "-",
          colis.nom_destinataire || "-",
          colis.nom_marchandise || "-",
          colis.poids_total?.toFixed(2) || "0",
          formatMontantWithDevise(colis.total_montant),
        ]),
      };

      exportTableToPDF(exportData, `colis_${formeEnvoi}`, {
        title: `${t("title")} - ${
          formeEnvoi === "groupage" ? t("groupage") : t("autresEnvois")
        }`,
      });
      message.success(t("exportPdf"));
    } catch (error) {
      message.error(t("exportError"));
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      if (!data?.data || data.data.length === 0) {
        message.warning("Aucune donnée à exporter");
        return;
      }

      const exportData = {
        headers: [
          "Référence",
          "Date Envoi",
          "Trafic",
          "Expéditeur",
          "Destinataire",
          "Marchandise",
          "Poids (Kg)",
          "Montant Total",
        ],
        rows: data.data.map((colis) => [
          formatRefColis(colis.ref_colis),
          formatDate(colis.date_envoi),
          colis.trafic_envoi || "-",
          colis.client_colis?.nom_exp || "-",
          colis.nom_destinataire || "-",
          colis.nom_marchandise || "-",
          colis.poids_total?.toFixed(2) || "0",
          formatMontantWithDevise(colis.total_montant),
        ]),
      };

      await exportTableToExcel(exportData, `colis_${formeEnvoi}`, {
        title: `${t("title")} - ${
          formeEnvoi === "groupage" ? t("groupage") : t("autresEnvois")
        }`,
      });
      message.success(t("exportExcel"));
    } catch (error) {
      message.error(t("exportError"));
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleValidate = async (id: number) => {
    await validateMutation.mutateAsync(id);
    refetch();
  };

  const columns: ColumnsType<Colis> = [
    {
      title: t("reference"),
      dataIndex: "ref_colis",
      key: "ref_colis",
      fixed: "left",
      width: 150,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: "bold" }}>
          {formatRefColis(text)}
        </Tag>
      ),
    },
    {
      title: t("dateEnvoi"),
      dataIndex: "date_envoi",
      key: "date_envoi",
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true,
    },
    {
      title: t("trafic"),
      dataIndex: "trafic_envoi",
      key: "trafic_envoi",
      width: 150,
      render: (trafic: string) => <Tag>{trafic}</Tag>,
      filters: [
        { text: t("traficImportAerien"), value: "Import Aérien" },
        { text: t("traficImportMaritime"), value: "Import Maritime" },
        { text: t("traficExportAerien"), value: "Export Aérien" },
        { text: t("traficExportMaritime"), value: "Export Maritime" },
      ],
    },
    {
      title: t("expediteur"),
      key: "expediteur",
      width: 200,
      render: (_, record) => record.client_colis?.nom_exp || "-",
    },
    {
      title: t("destinataire"),
      dataIndex: "nom_destinataire",
      key: "nom_destinataire",
      width: 200,
    },
    {
      title: t("marchandise"),
      dataIndex: "nom_marchandise",
      key: "nom_marchandise",
      width: 200,
      ellipsis: true,
    },
    {
      title: t("poidsKg"),
      dataIndex: "poids_total",
      key: "poids_total",
      width: 100,
      render: (poids: number) => poids?.toFixed(2) || "0",
      sorter: true,
    },
    {
      title: t("montantTotal"),
      dataIndex: "total_montant",
      key: "total_montant",
      width: 150,
      render: (montant: number) => formatMontantWithDevise(montant),
      sorter: true,
    },
    {
      title: tCommon("actions"),
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {hasPermission(colisPermissions.UPDATE) && onEdit && (
            <Tooltip title={t("modifier")}>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}

          {onView && (
            <Tooltip title={t("voirDetails")}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
              />
            </Tooltip>
          )}

          {hasPermission(colisPermissions.VALIDATE) && (
            <Tooltip title={t("valider")}>
              <Button
                type="default"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleValidate(record.id)}
                loading={validateMutation.isPending}
              />
            </Tooltip>
          )}

          {hasPermission(colisPermissions.DELETE) && (
            <Popconfirm
              title={t("deleteConfirm")}
              onConfirm={() => handleDelete(record.id)}
              okText={tCommon("yes")}
              cancelText={tCommon("no")}
            >
              <Tooltip title={t("supprimer")}>
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending}
                />
              </Tooltip>
            </Popconfirm>
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
              placeholder={t("searchPlaceholder")}
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
              placeholder={t("traficFilter")}
              allowClear
              value={traficFilter}
              onChange={setTraficFilter}
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="Import Aérien">{t("traficImportAerien")}</Option>
              <Option value="Import Maritime">
                {t("traficImportMaritime")}
              </Option>
              <Option value="Export Aérien">{t("traficExportAerien")}</Option>
              <Option value="Export Maritime">
                {t("traficExportMaritime")}
              </Option>
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

          <Col xs={24} sm={12} md={10}>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                size="large"
              >
                {tCommon("refresh")}
              </Button>

              <Button
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                loading={exporting}
                size="large"
              >
                PDF
              </Button>

              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                loading={exporting}
                size="large"
              >
                Excel
              </Button>

              {hasPermission(colisPermissions.CREATE) && onCreate && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onCreate}
                  size="large"
                >
                  {t("newColis")}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* TABLEAU */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : !data?.data || data.data.length === 0 ? (
          searchTerm ? (
            <EmptySearchState
              searchTerm={searchTerm}
              onClearSearch={() => handleSearch("")}
            />
          ) : (
            <EmptyListState
              title={t("emptyState")}
              description={
                formeEnvoi === "groupage"
                  ? t("emptyDescriptionGroupage")
                  : t("emptyDescription")
              }
              onCreateClick={onCreate}
              createLabel={t("newColis")}
            />
          )
        ) : (
          <Table
            columns={columns}
            dataSource={data.data}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: data?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => t("totalColis", { total }),
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
          />
        )}
      </Card>
    </div>
  );
};

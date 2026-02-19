import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Popconfirm,
  Tooltip,
  Card,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { Paiement } from "@types";
import { formatDate, formatMontantWithDevise } from "@utils/format";
import { usePaiementsList, useCancelPaiement } from "@hooks/usePaiements";
import { WithPermission } from "@components/common/WithPermission";
import { PERMISSIONS } from "@constants/permissions";

const { RangePicker } = DatePicker;

interface PaiementListProps {
  refColis?: string;
}

export const PaiementList: React.FC<PaiementListProps> = ({ refColis }) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const { data, isLoading, refetch } = usePaiementsList({
    ...pagination,
    search: searchTerm || undefined,
  });

  const cancelMutation = useCancelPaiement();

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

  const handleCancel = async (id: number) => {
    await cancelMutation.mutateAsync(id);
    refetch();
  };

  const columns: ColumnsType<Paiement> = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
      width: 150,
      render: (text: string) => text || "-",
    },
    {
      title: "Date",
      dataIndex: "date_paiement",
      key: "date_paiement",
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: true,
    },
    {
      title: "Montant",
      dataIndex: "montant",
      key: "montant",
      width: 150,
      render: (montant: number) => (
        <strong style={{ color: "#52c41a" }}>
          {formatMontantWithDevise(montant)}
        </strong>
      ),
      sorter: true,
    },
    {
      title: "Mode paiement",
      dataIndex: "mode_paiement",
      key: "mode_paiement",
      width: 150,
      render: (mode: string) => <Tag color="blue">{mode}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_: any, record: Paiement) => (
        <WithPermission permission={PERMISSIONS.PAIEMENTS.CANCEL}>
          <Popconfirm
            title="Annuler ce paiement ?"
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
                loading={cancelMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </WithPermission>
      ),
    },
  ];

  return (
    <div>
      {/* BARRE DE RECHERCHE */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Rechercher par référence..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
              size="large"
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
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

          <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
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
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: data?.total || 0,
            showSizeChanger: true,
            showTotal: (total: number) => `Total: ${total} paiements`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

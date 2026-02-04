import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Tag,
  Popconfirm,
  Tooltip,
  Card,
  Row,
  Col,
  Select,
  Switch,
  Spin,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { User } from "@types";
import { formatDate } from "@utils/format";
import { PERMISSIONS } from "@constants/permissions";
import { WithPermission } from "@components/common/WithPermission";
import { usersService } from "@services/users.service";
import { useQuery } from "@tanstack/react-query";

const { Title } = Typography;
const { Option } = Select;

export const UsersListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Récupérer les utilisateurs depuis l'API
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
    onError: (error: any) => {
      message.error('Erreur lors du chargement des utilisateurs');
      console.error('Error loading users:', error);
    },
  });

  const columns: ColumnsType<User> = [
    {
      title: "Nom d'utilisateur",
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: "Nom complet",
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Rôle",
      key: "role",
      width: 150,
      render: (_, record) => (
        <Tag color={record.role.code === "SUPER_ADMIN" ? "red" : "blue"}>
          {record.role.name}
        </Tag>
      ),
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Actif" : "Inactif"}
        </Tag>
      ),
    },
    {
      title: "Date création",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <WithPermission permission={PERMISSIONS.USERS.UPDATE}>
            <Tooltip title="Modifier">
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedUser(record);
                  setIsCreateMode(false);
                  setIsModalOpen(true);
                }}
              />
            </Tooltip>
          </WithPermission>

          <WithPermission permission={PERMISSIONS.USERS.DELETE}>
            <Popconfirm
              title="Supprimer cet utilisateur ?"
              okText="Oui"
              cancelText="Non"
            >
              <Tooltip title="Supprimer">
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </WithPermission>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Gestion des Utilisateurs</Title>

      {/* BARRE DE RECHERCHE */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={16} md={12}>
            <Input
              placeholder="Rechercher par nom, username, email..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>

          <Col xs={24} sm={8} md={12} style={{ textAlign: "right" }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                size="large"
                onClick={() => refetch()}
                loading={isLoading}
              >
                Actualiser
              </Button>

              <WithPermission permission={PERMISSIONS.USERS.CREATE}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => {
                    setSelectedUser(null);
                    setIsCreateMode(true);
                    setIsModalOpen(true);
                  }}
                >
                  Nouvel Utilisateur
                </Button>
              </WithPermission>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* TABLEAU */}
      <Card>
        <Table
          columns={columns}
          dataSource={users.filter((user) => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
              user.username.toLowerCase().includes(search) ||
              user.full_name.toLowerCase().includes(search) ||
              (user.email && user.email.toLowerCase().includes(search))
            );
          })}
          rowKey="id"
          scroll={{ x: 1000 }}
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} utilisateurs`,
          }}
        />
      </Card>

      {/* MODAL CRÉATION/ÉDITION */}
      <Modal
        title={isCreateMode ? "Nouvel Utilisateur" : "Modifier Utilisateur"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        footer={null}
        width={700}
      >
        <UserForm
          user={selectedUser || undefined}
          isCreateMode={isCreateMode}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Composant formulaire utilisateur (simplifié)
interface UserFormProps {
  user?: User;
  isCreateMode: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  isCreateMode,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role?.code || "OPERATEUR_COLIS",
    status: user?.status || "active",
  });

  const handleSubmit = () => {
    // TODO: Appel API
    console.log("Submit user:", formData);
    onSuccess();
  };

  return (
    <div style={{ padding: 20 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Input
          placeholder="Nom d'utilisateur"
          prefix={<UserOutlined />}
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          size="large"
        />
        <Input
          placeholder="Nom complet"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          size="large"
        />
        <Input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          size="large"
        />
        <Input
          placeholder="Téléphone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          size="large"
        />
        <Select
          placeholder="Rôle"
          value={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value })}
          style={{ width: "100%" }}
          size="large"
        >
          <Option value="SUPER_ADMIN">Super Administrateur</Option>
          <Option value="ADMIN">Administrateur</Option>
          <Option value="OPERATEUR_COLIS">Opérateur Colis</Option>
          <Option value="VALIDATEUR">Validateur</Option>
          <Option value="CAISSIER">Caissier</Option>
        </Select>
        <div>
          <span>Statut: </span>
          <Switch
            checked={formData.status === "active"}
            onChange={(checked) =>
              setFormData({
                ...formData,
                status: checked ? "active" : "inactive",
              })
            }
          />
          <span style={{ marginLeft: 8 }}>
            {formData.status === "active" ? "Actif" : "Inactif"}
          </span>
        </div>
        <Space>
          <Button type="primary" onClick={handleSubmit} size="large">
            Enregistrer
          </Button>
          <Button onClick={onCancel} size="large">
            Annuler
          </Button>
        </Space>
      </Space>
    </div>
  );
};

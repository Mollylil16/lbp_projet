import React, { useState } from "react";
import { Badge, Popover, Button, List, Typography, Space, Empty, Divider } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNotifications } from "@contexts/NotificationsContext";
import { formatDate } from "@utils/format";
import "./NotificationBell.css";

const { Text } = Typography;

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const handleClickNotification = (notification: any) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "#52c41a";
      case "warning":
        return "#faad14";
      case "error":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  const content = (
    <div className="notification-popover">
      <div className="notification-header">
        <Text strong>Notifications</Text>
        <Space>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              Tout marquer lu
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
            >
              Tout effacer
            </Button>
          )}
        </Space>
      </div>
      <Divider style={{ margin: "8px 0" }} />
      <div className="notification-list">
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucune notification"
            style={{ padding: "20px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`notification-item ${!item.read ? "unread" : ""}`}
                onClick={() => handleClickNotification(item)}
                style={{ cursor: item.actionUrl ? "pointer" : "default" }}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    <span style={{ fontSize: 20 }}>
                      {getNotificationIcon(item.type)}
                    </span>
                  </div>
                  <div className="notification-body">
                    <div className="notification-title">
                      <Text strong={!item.read}>{item.title}</Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={(e) => handleRemove(item.id, e)}
                        className="notification-close"
                      />
                    </div>
                    <Text type="secondary" className="notification-message">
                      {item.message}
                    </Text>
                    <div className="notification-footer">
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatDate(item.timestamp.toISOString())}
                      </Text>
                      {item.category && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          • {item.category}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="notification-popover-overlay"
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: 18 }}
          onClick={() => setOpen(!open)}
        />
      </Badge>
    </Popover>
  );
};

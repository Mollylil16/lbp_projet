import React from "react";
import { Alert } from "antd";
import { WifiOutlined, CloudSyncOutlined } from "@ant-design/icons";
import { useServiceWorker } from "@hooks/useServiceWorker";
import "./OfflineIndicator.css";

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useServiceWorker();

  if (isOnline) {
    return null;
  }

  return (
    <Alert
      message="Mode hors ligne"
      description="Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées."
      type="warning"
      icon={<WifiOutlined />}
      showIcon
      closable
      className="offline-indicator"
      banner
    />
  );
};

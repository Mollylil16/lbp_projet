/**
 * Barre de progression pour les actions longues
 * Affiche le pourcentage et permet d'annuler
 */

import React from "react";
import { Progress, Button, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import "./ProgressBar.css";

interface ProgressBarProps {
  percent: number;
  status?: "active" | "success" | "exception" | "normal";
  showInfo?: boolean;
  format?: (percent?: number) => React.ReactNode;
  onCancel?: () => void;
  title?: string;
  description?: string;
  strokeColor?: string;
  trailColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  status = "active",
  showInfo = true,
  format,
  onCancel,
  title,
  description,
  strokeColor,
  trailColor,
}) => {
  const defaultFormat = (percent?: number) => `${Math.round(percent || 0)}%`;

  return (
    <div className="progress-bar-container">
      {(title || description) && (
        <div className="progress-bar-header">
          {title && <div className="progress-bar-title">{title}</div>}
          {description && (
            <div className="progress-bar-description">{description}</div>
          )}
        </div>
      )}

      <div className="progress-bar-content">
        <Progress
          percent={percent}
          status={status}
          showInfo={showInfo}
          format={format || defaultFormat}
          strokeColor={strokeColor}
          trailColor={trailColor}
          className="progress-bar-progress"
        />

        {onCancel && (
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onCancel}
            className="progress-bar-cancel"
          >
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
};

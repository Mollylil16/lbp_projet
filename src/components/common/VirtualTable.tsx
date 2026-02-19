/**
 * Tableau virtuel avec react-window pour de meilleures performances
 * Affiche uniquement les lignes visibles dans le viewport
 */

import React, { useMemo, useRef, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import "./VirtualTable.css";

interface VirtualTableProps<T> extends Omit<TableProps<T>, "components"> {
  scrollY: number;
  rowHeight?: number;
}

/**
 * Tableau virtuel optimisé pour de grandes listes
 */
export function VirtualTable<T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey,
  scrollY = 400,
  rowHeight = 54,
  ...tableProps
}: VirtualTableProps<T>) {
  const [widths, setWidths] = useState<number[]>([]);
  const [totalWidth, setTotalWidth] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  // Calculer les largeurs de colonnes
  useEffect(() => {
    if (!columns || columns.length === 0) return;

    const calculatedWidths = columns.map((col) => {
      if (typeof col.width === "number") {
        return col.width;
      }
      if (col.width) {
        // Convertir les largeurs comme "200px" en nombres
        const match = String(col.width).match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 150;
      }
      return 150; // Largeur par défaut
    });

    setWidths(calculatedWidths);
    setTotalWidth(calculatedWidths.reduce((sum, w) => sum + w, 0));
  }, [columns]);

  // Composant de ligne virtuelle
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const row = dataSource?.[index];
    if (!row) return null;

    const key =
      typeof rowKey === "function" ? (rowKey as any)(row, index) : row[rowKey as string];

    return (
      <div
        key={key}
        style={{
          ...style,
          display: "flex",
          borderBottom: "1px solid #f0f0f0",
          alignItems: "center",
        }}
        className="virtual-table-row"
      >
        {columns?.map((col: any, colIndex: number) => {
          // Vérifier si c'est une colonne simple (ColumnType) et non un groupe
          const column = col;
          const dataIndex = column.dataIndex;

          const value = dataIndex
            ? (row[dataIndex as string] as any)
            : undefined;

          const renderedValue = column.render
            ? column.render(value, row, index)
            : value;

          return (
            <div
              key={col.key || colIndex}
              style={{
                width: widths[colIndex] || 150,
                padding: "12px 16px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              title={String(renderedValue)}
            >
              {renderedValue}
            </div>
          );
        })}
      </div>
    );
  };

  // En-têtes de colonnes
  const HeaderRow = () => (
    <div
      style={{
        display: "flex",
        borderBottom: "2px solid #f0f0f0",
        backgroundColor: "#fafafa",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
      className="virtual-table-header"
    >
      {columns?.map((col, colIndex) => {
        const column = col as any;
        const title =
          typeof column.title === "function"
            ? column.title({})
            : column.title || "";

        return (
          <div
            key={column.key || colIndex}
            style={{
              width: widths[colIndex] || 150,
              padding: "12px 16px",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {title}
          </div>
        );
      })}
    </div>
  );

  if (!dataSource || dataSource.length === 0) {
    return (
      <Table
        {...tableProps}
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={false}
      />
    );
  }

  return (
    <div ref={tableRef} className="virtual-table-container">
      <HeaderRow />
      <List
        height={scrollY}
        itemCount={dataSource.length}
        itemSize={rowHeight}
        width="100%"
        className="virtual-table-list"
      >
        {Row}
      </List>
    </div>
  );
}

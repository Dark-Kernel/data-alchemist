"use client";

import { DataGrid as ReactDataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";

interface DataGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowsChange?: (rows: T[]) => void;
  errorCells?: { row: number; col: string }[];
}

export function DataGrid<T extends { [key: string]: any }>({
  columns,
  rows,
  onRowsChange,
  errorCells,
}: DataGridProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data to display.</p>
      </div>
    );
  }

  const columnsWithHighlighting = columns.map((col) => ({
    ...col,
    cellClass: (row: T) => {
      const rowIndex = rows.indexOf(row);
      if (errorCells?.some((cell) => cell.row === rowIndex && cell.col === col.key)) {
        return "bg-red-200";
      }
      return "";
    },
  }));

  return (
    <ReactDataGrid
      columns={columnsWithHighlighting}
      rows={rows}
      onRowsChange={onRowsChange}
      className="rdg-light"
    />
  );
}

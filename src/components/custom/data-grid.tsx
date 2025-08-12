"use client";

import { DataGrid as ReactDataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";

interface DataGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowsChange?: (rows: T[]) => void;
}

export function DataGrid<T>({ columns, rows, onRowsChange }: DataGridProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data to display.</p>
      </div>
    );
  }

  return (
    <ReactDataGrid
      columns={columns}
      rows={rows}
      onRowsChange={onRowsChange}
      className="rdg-light"
    />
  );
}

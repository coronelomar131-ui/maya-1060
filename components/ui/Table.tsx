'use client';

import React from 'react';

interface TableProps {
  columns: Array<{
    key: string;
    label: string;
    width?: string;
  }>;
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: (row: any) => React.ReactNode;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No hay datos',
  actions,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C62828]"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left font-semibold text-gray-900"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left font-semibold text-gray-900">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-gray-700">
                  {row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

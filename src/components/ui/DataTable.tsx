import React from 'react';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export default function DataTable<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado.',
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-[#6b7280]">Carregando...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <EmptyState title={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-[#6b7280] text-xs uppercase font-semibold border-b border-gray-100">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-5 py-4 ${col.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => col.sortable && onSort?.(col.key, sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-[#1e40af]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, idx) => (
            <tr key={String(item[keyField])} className="hover:bg-gray-50 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards' }}>
              {columns.map(col => (
                <td key={col.key} className="px-5 py-4">
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
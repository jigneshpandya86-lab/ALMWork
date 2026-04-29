import React from 'react';
import { TableColumnDef } from '@/types';

type DynamicTableBlockProps = {
  columns: TableColumnDef[];
  rowData: Record<string, unknown>[];
  title?: string;
};

const DynamicTableBlock: React.FC<DynamicTableBlockProps> = ({ columns, rowData, title }) => (
  <section className="space-y-2">
    {title ? <h3 className="text-base font-semibold">{title}</h3> : null}
    <div className="w-full overflow-x-auto border border-slate-300 rounded-md">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((col) => (
              <th key={`${col.csvColumn}-${col.label}`} className="border border-slate-300 px-3 py-2 text-left whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, rowIndex) => (
            <tr key={`dynamic-row-${rowIndex}`} className="even:bg-slate-50">
              {columns.map((col) => (
                <td key={`${rowIndex}-${col.csvColumn}`} className="border border-slate-300 px-3 py-2 whitespace-nowrap">
                  {String(row[col.csvColumn] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default DynamicTableBlock;

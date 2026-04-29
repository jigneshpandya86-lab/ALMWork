import React from 'react';
import { CsvRow, StudentMetaFieldDef } from '@/types';

type StudentMetaBlockProps = {
  fields: StudentMetaFieldDef[];
  rowData?: CsvRow;
  title?: string;
};

const StudentMetaBlock: React.FC<StudentMetaBlockProps> = ({ fields, rowData = {}, title }) => (
  <section className="space-y-2">
    {title ? <h3 className="text-base font-semibold">{title}</h3> : null}
    <div className="grid grid-cols-2 gap-2 text-sm">
      {fields.map((field) => (
        <div key={`${field.label}-${field.csvKey}`} className="border border-slate-300 rounded px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">{field.label}</p>
          <p className="font-medium text-slate-900">{String(rowData[field.csvKey] ?? '-')}</p>
        </div>
      ))}
    </div>
  </section>
);

export default StudentMetaBlock;

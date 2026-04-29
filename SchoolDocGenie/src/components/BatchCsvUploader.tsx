'use client';

import React from 'react';

type BatchCsvUploaderProps = {
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function BatchCsvUploader({ file, onChange }: BatchCsvUploaderProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="batch-csv">CSV File</label>
      <input
        id="batch-csv"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
      />
      {file ? <p className="text-xs text-emerald-700 mt-2">Selected: {file.name}</p> : null}
    </div>
  );
}

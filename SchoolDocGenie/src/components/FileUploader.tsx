'use client';

import React, { useRef, useState } from 'react';

type FileUploaderProps = {
  onFileSelected: (file: File | null) => void;
  file: File | null;
};

export default function FileUploader({ onFileSelected, file }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">CSV File</p>
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const selected = event.dataTransfer.files?.[0] ?? null;
          if (selected && selected.name.toLowerCase().endsWith('.csv')) {
            onFileSelected(selected);
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            onFileSelected(selected);
          }}
        />
        <p className="text-slate-700 font-medium">Drop CSV here or click to upload</p>
        <p className="text-xs text-slate-500 mt-1">Only .csv files are supported</p>
      </div>
      {file ? <p className="text-sm text-emerald-700">Selected: {file.name}</p> : null}
    </div>
  );
}

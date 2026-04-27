'use client';

import React, { useCallback, useRef, useState } from 'react';
import { FileUploaderProps } from '@/types';
import { parseJSON } from '@/lib/jsonParser';

export default function FileUploader({ onStudentsLoaded, onError }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      onError('Please upload a valid JSON file (.json)');
      return;
    }
    setIsLoading(true);
    setFileName(file.name);
    try {
      const students = await parseJSON(file);
      onStudentsLoaded(students);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to parse JSON file');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [onStudentsLoaded, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const loadSample = useCallback(async () => {
    setIsLoading(true);
    setFileName('sample-students.json');
    try {
      const res = await fetch('/sample-students.json');
      if (!res.ok) throw new Error('Failed to load sample data');
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.students ?? [];
      const { validateStudents } = await import('@/lib/jsonParser');
      const { valid } = validateStudents(arr);
      onStudentsLoaded(valid);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load sample data');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [onStudentsLoaded, onError]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload JSON file"
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
          transition-all duration-200 select-none
          ${isDragging
            ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
            : fileName
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
      >
        <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleChange} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
            <p className="text-indigo-600 font-medium text-sm">Processing {fileName}…</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-700">{fileName}</p>
              <p className="text-xs text-emerald-500 mt-0.5">Loaded successfully — click to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)' }}>
              <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Drag & drop your JSON file</p>
              <p className="text-slate-400 text-sm mt-0.5">or click to browse — .json files only</p>
            </div>
            {isDragging && (
              <div className="absolute inset-0 rounded-2xl bg-indigo-100/60 flex items-center justify-center">
                <p className="font-semibold text-indigo-600">Drop to upload</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Sample data button */}
      <button
        onClick={loadSample}
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 text-indigo-600 font-medium text-sm
          hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Load Sample Data (15 students, grades 6–8)
      </button>
    </div>
  );
}

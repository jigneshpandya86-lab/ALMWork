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
    if (!file.name.endsWith('.json')) { onError('Please upload a .json file'); return; }
    setIsLoading(true);
    setFileName(file.name);
    try {
      const students = await parseJSON(file);
      onStudentsLoaded(students);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to parse file');
      setFileName(null);
    } finally { setIsLoading(false); }
  }, [onStudentsLoaded, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) processFile(f);
  }, [processFile]);

  const loadSample = useCallback(async () => {
    setIsLoading(true); setFileName('sample-students.json');
    try {
      const res = await fetch('/sample-students.json');
      if (!res.ok) throw new Error('Failed to fetch sample');
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.students ?? [];
      const { validateStudents } = await import('@/lib/jsonParser');
      const { valid } = validateStudents(arr);
      onStudentsLoaded(valid);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load sample');
      setFileName(null);
    } finally { setIsLoading(false); }
  }, [onStudentsLoaded, onError]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="relative rounded-2xl p-10 text-center cursor-pointer select-none transition-all duration-200"
        style={{
          border: `2px dashed ${isDragging ? '#6366f1' : fileName ? '#10b981' : '#c7d2fe'}`,
          background: isDragging
            ? 'rgba(99,102,241,0.06)'
            : fileName
            ? 'rgba(16,185,129,0.05)'
            : 'rgba(238,242,255,0.5)',
          transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleChange} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background:'rgba(79,70,229,0.1)' }}>
              <div className="w-5 h-5 rounded-full border-[2.5px] border-indigo-200 border-t-indigo-500"
                style={{ animation:'spin .8s linear infinite' }} />
            </div>
            <p className="font-semibold text-indigo-600 text-sm">Processing {fileName}…</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.2))' }}>
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-emerald-700 text-lg">{fileName}</p>
              <p className="text-sm text-emerald-500 mt-0.5">Loaded — click to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-700 text-lg">Drop your JSON file here</p>
              <p className="text-slate-400 text-sm mt-1">or click anywhere to browse &nbsp;·&nbsp; .json only</p>
            </div>
            {isDragging && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                style={{ background:'rgba(99,102,241,0.1)', backdropFilter:'blur(4px)' }}>
                <div className="px-6 py-3 rounded-xl font-bold text-indigo-700"
                  style={{ background:'rgba(255,255,255,0.9)', border:'2px solid #6366f1' }}>
                  Release to upload
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background:'linear-gradient(to right,transparent,#c7d2fe,transparent)' }} />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px" style={{ background:'linear-gradient(to right,transparent,#c7d2fe,transparent)' }} />
      </div>

      {/* Sample button */}
      <button
        onClick={loadSample} disabled={isLoading}
        className="btn-outline w-full py-3 px-5 flex items-center justify-center gap-2.5 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
        </svg>
        Load Sample Dataset &nbsp;
        <span className="badge" style={{ background:'rgba(79,70,229,0.12)', color:'#4f46e5' }}>15 students · Grades 6–8</span>
      </button>
    </div>
  );
}

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { FileUploaderProps } from '@/types';
import { parseJSON } from '@/lib/jsonParser';

export default function FileUploader({ onStudentsLoaded, onError }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
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
    },
    [onStudentsLoaded, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

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
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload JSON file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleChange}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-blue-600 font-medium">Processing {fileName}…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {fileName ? (
              <p className="text-green-600 font-medium">{fileName} loaded successfully!</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">Drag & drop your JSON file here</p>
                <p className="text-gray-400 text-sm">or click to browse</p>
                <p className="text-gray-400 text-xs">Supported format: .json</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-gray-400 text-sm">OR</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <button
        onClick={loadSample}
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg border border-blue-300 text-blue-600 font-medium
          hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Load Sample Data (Demo)
      </button>
    </div>
  );
}

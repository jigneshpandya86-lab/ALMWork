'use client';

import React, { useState } from 'react';
import { DownloadLinksProps } from '@/types';
import { downloadPDF } from '@/lib/pdfGenerator';
import { formatFileSize } from '@/lib/utils';

export default function DownloadLinks({ pdfs }: DownloadLinksProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const handleDownload = (pdf: (typeof pdfs)[0]) => {
    setDownloading(pdf.studentId);
    downloadPDF(pdf.blob, pdf.filename);
    setTimeout(() => setDownloading(null), 800);
  };

  const handleDownloadAll = async () => {
    if (pdfs.length === 0) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      pdfs.forEach((pdf) => zip.file(pdf.filename, pdf.blob));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SchoolDocGenie_PDFs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: download individually
      pdfs.forEach((pdf, i) =>
        setTimeout(() => downloadPDF(pdf.blob, pdf.filename), i * 200)
      );
    } finally {
      setZipping(false);
    }
  };

  const totalSize = pdfs.reduce((sum, p) => sum + p.size, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{pdfs.length}</span> PDFs generated &middot;{' '}
          <span className="text-gray-500">Total: {formatFileSize(totalSize)}</span>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={zipping}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {zipping ? (
            <>
              <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
              Zipping…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All as ZIP
            </>
          )}
        </button>
      </div>

      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
        {pdfs.map((pdf) => (
          <div
            key={pdf.studentId}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{pdf.filename}</p>
                <p className="text-xs text-gray-400">{formatFileSize(pdf.size)}</p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(pdf)}
              disabled={downloading === pdf.studentId}
              className="flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
            >
              {downloading === pdf.studentId ? (
                <div className="animate-spin h-3 w-3 border-b border-white rounded-full" />
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

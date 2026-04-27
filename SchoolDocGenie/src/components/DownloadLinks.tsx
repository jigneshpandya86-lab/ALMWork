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
    if (!pdfs.length) return;
    setZipping(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      pdfs.forEach((p) => zip.file(p.filename, p.blob));
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
      pdfs.forEach((p, i) => setTimeout(() => downloadPDF(p.blob, p.filename), i * 200));
    } finally {
      setZipping(false);
    }
  };

  const totalSize = pdfs.reduce((s, p) => s + p.size, 0);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">
              {pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''} ready
            </p>
            <p className="text-xs text-slate-400">Total size: {formatFileSize(totalSize)}</p>
          </div>
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={zipping}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white
            transition-all duration-150 disabled:opacity-50 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
        >
          {zipping ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Zipping…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download All as ZIP
            </>
          )}
        </button>
      </div>

      {/* PDF list */}
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {pdfs.map((pdf, idx) => (
          <div
            key={pdf.studentId}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700 truncate">{pdf.filename}</p>
              <p className="text-xs text-slate-400">{formatFileSize(pdf.size)}</p>
            </div>

            <span className="text-xs text-slate-300 font-mono flex-shrink-0 hidden sm:block">
              #{String(idx + 1).padStart(2, '0')}
            </span>

            <button
              onClick={() => handleDownload(pdf)}
              disabled={downloading === pdf.studentId}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                text-white transition-all duration-150 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}
            >
              {downloading === pdf.studentId ? (
                <div className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
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

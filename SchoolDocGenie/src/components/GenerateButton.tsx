'use client';

import React, { useState } from 'react';
import { GenerateButtonProps } from '@/types';
import { filterByGrade } from '@/lib/jsonParser';
import { loadTemplate, generateDocumentsForBatch } from '@/lib/gemini';
import { generateMultiplePDFs } from '@/lib/pdfGenerator';

export default function GenerateButton({
  students, docType, grade,
  onGenerateStart, onProgress, onGenerateComplete, onError,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredCount = grade ? filterByGrade(students, grade).length : students.length;
  const canGenerate = students.length > 0 && docType !== null && grade !== null && filteredCount > 0;

  const handleGenerate = async () => {
    if (!canGenerate || !docType || !grade) return;
    setIsGenerating(true);
    onGenerateStart();
    try {
      const filtered = filterByGrade(students, grade);
      if (filtered.length === 0) { onError(`No students found for Grade ${grade}`); return; }
      const template = await loadTemplate(docType);
      const aiTexts = await generateDocumentsForBatch(filtered, template, grade,
        (c, t, n) => onProgress(c, t, n));
      const pdfs = await generateMultiplePDFs(filtered, aiTexts, docType, template,
        (c, t, n) => onProgress(c, t, n));
      onGenerateComplete(pdfs);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const docLabel = docType === 'marksheet' ? 'Marksheets'
    : docType === 'leavingCert' ? 'Leaving Certificates'
    : 'Evaluation Reports';

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200
          flex items-center justify-center gap-3
          ${canGenerate && !isGenerating
            ? 'gradient-btn text-white shadow-md'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Generating PDFs…</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>
              {canGenerate
                ? `Generate ${filteredCount} ${docLabel}`
                : 'Generate PDFs'}
            </span>
            {canGenerate && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
                Grade {grade}
              </span>
            )}
          </>
        )}
      </button>

      {/* Contextual hints */}
      {!canGenerate && (
        <p className="text-center text-xs text-slate-400">
          {students.length === 0
            ? 'Upload student data in Step 1 to continue'
            : !docType
            ? 'Select a document type in Step 3'
            : !grade
            ? 'Select a grade in Step 3'
            : `No students found for Grade ${grade}`}
        </p>
      )}
    </div>
  );
}

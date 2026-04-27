'use client';

import React, { useState } from 'react';
import { GenerateButtonProps } from '@/types';
import { filterByGrade } from '@/lib/jsonParser';
import { loadTemplate, generateDocumentsForBatch } from '@/lib/gemini';
import { generateMultiplePDFs } from '@/lib/pdfGenerator';

export default function GenerateButton({
  students,
  docType,
  grade,
  onGenerateStart,
  onProgress,
  onGenerateComplete,
  onError,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredCount = grade
    ? filterByGrade(students, grade).length
    : students.length;

  const canGenerate = students.length > 0 && docType !== null && grade !== null && filteredCount > 0;

  const handleGenerate = async () => {
    if (!canGenerate || !docType || !grade) return;

    setIsGenerating(true);
    onGenerateStart();

    try {
      const filtered = filterByGrade(students, grade);

      if (filtered.length === 0) {
        onError(`No students found for Grade ${grade}`);
        return;
      }

      const template = await loadTemplate(docType);

      const aiTexts = await generateDocumentsForBatch(
        filtered,
        template,
        grade,
        (current, total, name) => onProgress(current, total, name)
      );

      const pdfs = await generateMultiplePDFs(
        filtered,
        aiTexts,
        docType,
        template,
        (current, total, name) => onProgress(current, total, name)
      );

      onGenerateComplete(pdfs);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3
          ${canGenerate && !isGenerating
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-[0.99]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Generating PDFs…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate PDFs
            {canGenerate && (
              <span className="ml-1 px-2 py-0.5 bg-blue-500 rounded-full text-sm">
                {filteredCount}
              </span>
            )}
          </>
        )}
      </button>

      {!canGenerate && (
        <div className="text-sm text-gray-400 text-center space-y-1">
          {students.length === 0 && <p>Upload student data to continue</p>}
          {students.length > 0 && !docType && <p>Select a document type</p>}
          {students.length > 0 && docType && !grade && <p>Select a grade</p>}
          {students.length > 0 && docType && grade && filteredCount === 0 && (
            <p>No students in Grade {grade}</p>
          )}
        </div>
      )}
    </div>
  );
}

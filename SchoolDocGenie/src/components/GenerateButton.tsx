'use client';

import React, { useState } from 'react';
import { GenerateButtonProps } from '@/types';
import { filterByGrade } from '@/lib/jsonParser';
import { generateRemarksForBatch } from '@/lib/remarks';
import { generateMultiplePDFs } from '@/lib/pdfGenerator';
import AttendanceRegisterForm from './AttendanceRegisterForm';

export default function GenerateButton({
  students, docType, grade,
  onGenerateStart, onProgress, onGenerateComplete, onError,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);

  const filteredCount = grade ? filterByGrade(students, grade).length : 0;
  const canGenerate = students.length > 0 && !!docType && !!grade && filteredCount > 0;

  const handleGenerate = async () => {
    if (!canGenerate || !docType || !grade) return;

    if (docType === 'attendanceRegister') {
      setShowAttendanceForm(true);
      return;
    }

    setIsGenerating(true);
    onGenerateStart();
    try {
      const filtered = filterByGrade(students, grade);
      const remarks = generateRemarksForBatch(filtered, docType, (c, t, n) => onProgress(c, t, n));
      const pdfs = await generateMultiplePDFs(filtered, remarks, docType, (c, t, n) => onProgress(c, t, n));
      onGenerateComplete(pdfs);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Generation failed');
    } finally { setIsGenerating(false); }
  };

  const handleAttendanceGenerate = async (attendanceData: Map<string, { month: number; year: number; days: boolean[] }>) => {
    if (!docType || !grade) return;
    setShowAttendanceForm(false);
    setIsGenerating(true);
    onGenerateStart();
    try {
      const filtered = filterByGrade(students, grade);
      const remarks = new Map<string, string>();
      filtered.forEach(s => {
        const data = attendanceData.get(s.id);
        if (data) {
          const presentDays = data.days.filter(d => d).length;
          const percentage = Math.round((presentDays / data.days.length) * 100);
          remarks.set(s.id, String(percentage));
        }
      });

      const pdfs = await generateMultiplePDFs(filtered, remarks, docType, (c, t, n) => onProgress(c, t, n), attendanceData, undefined, grade);
      onGenerateComplete(pdfs);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Generation failed');
    } finally { setIsGenerating(false); }
  };

  const docLabel = docType === 'marksheet' ? 'Marksheets'
    : docType === 'leavingCert' ? 'Leaving Certificates'
    : docType === 'attendanceRegister' ? 'Attendance Registers'
    : 'Evaluation Reports';

  return (
    <>
      <div className="space-y-4">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="btn-primary w-full py-4 px-6 text-base flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                style={{ animation:'spin .7s linear infinite' }} />
              Generating PDFs… please wait
            </>
          ) : canGenerate ? (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Generate {filteredCount} {docLabel}
              <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20">Grade {grade}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Generate PDFs
            </>
          )}
        </button>

        {!canGenerate && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-500"
            style={{ background:'rgba(241,245,249,0.8)', border:'1px dashed #e2e8f0' }}>
            <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {students.length === 0 ? 'Upload student data in Step 1 to continue'
              : !docType ? 'Select a document type in Step 3'
              : !grade ? 'Select a grade in Step 3'
              : `No students found for Grade ${grade}`}
          </div>
        )}
      </div>

      {showAttendanceForm && (
        <AttendanceRegisterForm
          students={students}
          grade={grade!}
          onGenerate={handleAttendanceGenerate}
          onClose={() => setShowAttendanceForm(false)}
        />
      )}
    </>
  );
}

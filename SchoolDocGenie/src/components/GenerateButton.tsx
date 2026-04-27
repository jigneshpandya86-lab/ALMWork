'use client';

import React, { useState } from 'react';
import { GenerateButtonProps } from '@/types';
import { filterByGrade } from '@/lib/jsonParser';
import { generateRemarksForBatch } from '@/lib/remarks';
import { generateMultiplePDFs } from '@/lib/pdfGenerator';

type Mode = 'all' | 'single';

export default function GenerateButton({
  students, docType, grade,
  onGenerateStart, onProgress, onGenerateComplete, onError,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<Mode>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const gradeStudents = grade ? filterByGrade(students, grade) : [];
  const canGenerate = students.length > 0 && !!docType && !!grade && gradeStudents.length > 0
    && (mode === 'all' || !!selectedStudentId);

  const handleGenerate = async () => {
    if (!canGenerate || !docType || !grade) return;
    setIsGenerating(true);
    onGenerateStart();
    try {
      const targets = mode === 'single'
        ? gradeStudents.filter(s => s.id === selectedStudentId)
        : gradeStudents;
      const remarks = generateRemarksForBatch(targets, docType, (c, t, n) => onProgress(c, t, n));
      const pdfs = await generateMultiplePDFs(targets, remarks, docType, (c, t, n) => onProgress(c, t, n));
      onGenerateComplete(pdfs);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Generation failed');
    } finally { setIsGenerating(false); }
  };

  const docLabel = docType === 'marksheet' ? 'Marksheets'
    : docType === 'leavingCert' ? 'Leaving Certificates'
    : 'Evaluation Reports';

  const generateCount = mode === 'all' ? gradeStudents.length : 1;
  const generateLabel = mode === 'all'
    ? `Generate ${gradeStudents.length} ${docLabel}`
    : 'Generate for Student';

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      {gradeStudents.length > 0 && (
        <div className="flex gap-2 p-1 rounded-xl" style={{ background:'rgba(241,245,249,0.8)', width:'fit-content' }}>
          {(['all', 'single'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setSelectedStudentId(''); }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={mode === m ? {
                background: 'white',
                color: '#4f46e5',
                boxShadow: '0 1px 4px rgba(79,70,229,0.15)',
              } : { color: '#94a3b8' }}>
              {m === 'all' ? `All (${gradeStudents.length})` : 'Single Student'}
            </button>
          ))}
        </div>
      )}

      {/* Single student picker */}
      {mode === 'single' && gradeStudents.length > 0 && (
        <select
          value={selectedStudentId}
          onChange={e => setSelectedStudentId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1.5px solid #e2e8f0',
            color: selectedStudentId ? '#1e293b' : '#94a3b8',
          }}
          onFocus={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; }}
          onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none'; }}
        >
          <option value="">— Select a student —</option>
          {gradeStudents.map(s => (
            <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollno})</option>
          ))}
        </select>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="btn-primary w-full py-4 px-6 text-base flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
              style={{ animation:'spin .7s linear infinite' }} />
            Generating {generateCount > 1 ? `${generateCount} PDFs` : 'PDF'}… please wait
          </>
        ) : canGenerate ? (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {generateLabel}
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
            : gradeStudents.length === 0 ? `No students found for Grade ${grade}`
            : 'Select a student above'}
        </div>
      )}
    </div>
  );
}

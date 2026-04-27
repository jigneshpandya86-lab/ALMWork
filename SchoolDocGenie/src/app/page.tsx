'use client';

import React, { useState } from 'react';
import { Student, DocType, GeneratedPDF, GenerationProgress } from '@/types';
import FileUploader from '@/components/FileUploader';
import StudentTable from '@/components/StudentTable';
import TemplateSelector from '@/components/TemplateSelector';
import GenerateButton from '@/components/GenerateButton';
import ProgressBar from '@/components/ProgressBar';
import DownloadLinks from '@/components/DownloadLinks';

function StepBadge({ step, active, done }: { step: number; active: boolean; done: boolean }) {
  if (done) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
      ${active
        ? 'text-white'
        : 'bg-slate-100 text-slate-400'}`}
      style={active ? { background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' } : {}}>
      {step}
    </div>
  );
}

function StepCard({
  step, title, subtitle, active, done, children,
}: {
  step: number; title: string; subtitle?: string;
  active: boolean; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`card p-6 transition-all duration-200 ${active ? 'step-active' : done ? 'step-done' : ''}`}>
      <div className="flex items-start gap-3 mb-6">
        <StepBadge step={step} active={active} done={done} />
        <div>
          <h2 className={`font-semibold text-base leading-tight ${active ? 'text-indigo-700' : done ? 'text-emerald-700' : 'text-slate-400'}`}>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const STATS = [
  { label: 'Document Types', value: '3' },
  { label: 'Grades Supported', value: '6–8' },
  { label: 'AI-Powered', value: '100%' },
  { label: 'Browser-Only', value: '✓' },
];

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0, total: 0, currentStudentName: '', status: 'idle',
  });
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([]);

  const handleStudentsLoaded = (loaded: Student[]) => {
    setStudents(loaded);
    setError(null);
    setGeneratedPDFs([]);
    setProgress({ current: 0, total: 0, currentStudentName: '', status: 'idle' });
  };

  const handleSelect = (docType: DocType, grade: string) => {
    setSelectedDocType(docType);
    setSelectedGrade(grade);
    setGeneratedPDFs([]);
    setProgress({ current: 0, total: 0, currentStudentName: '', status: 'idle' });
  };

  const handleGenerateStart = () => {
    setGeneratedPDFs([]);
    setProgress({ current: 0, total: 0, currentStudentName: '', status: 'generating' });
    setError(null);
  };

  const handleProgress = (current: number, total: number, name: string) =>
    setProgress({ current, total, currentStudentName: name, status: 'generating' });

  const handleComplete = (pdfs: GeneratedPDF[]) => {
    setGeneratedPDFs(pdfs);
    setProgress((p) => ({ ...p, status: 'complete' }));
  };

  const handleError = (msg: string) => {
    setError(msg);
    setProgress((p) => ({ ...p, status: 'error', error: msg }));
  };

  const step1Done = students.length > 0;
  const step3Done = selectedDocType !== null && selectedGrade !== null;
  const showProgress = progress.status !== 'idle';
  const showDownloads = generatedPDFs.length > 0;

  const noApiKey =
    !process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'your_gemini_api_key_here';

  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <div className="text-center py-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5
          bg-indigo-50 text-indigo-600 border border-indigo-100">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          AI-Powered School Documents
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-3">
          <span className="gradient-text">SchoolDoc</span>
          <span className="text-slate-800">Genie</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
          Generate professional school documents for every student in seconds — marksheets, leaving certificates, and evaluation reports.
        </p>

        {/* Stats row */}
        <div className="mt-8 inline-grid grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200 bg-slate-200 shadow-sm">
          {STATS.map(({ label, value }) => (
            <div key={label} className="bg-white px-6 py-3 text-center">
              <p className="text-xl font-bold gradient-text">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── API key notice ── */}
      {noApiKey && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm
          bg-amber-50 border border-amber-200 text-amber-700 animate-fade-in-up">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Gemini API key not configured</strong> — PDFs will use built-in remark templates.
            {' '}Add <code className="px-1 py-0.5 bg-amber-100 rounded text-xs font-mono">NEXT_PUBLIC_GEMINI_API_KEY</code> to{' '}
            <code className="px-1 py-0.5 bg-amber-100 rounded text-xs font-mono">.env.local</code> for AI-powered remarks.
          </span>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm
          bg-red-50 border border-red-200 text-red-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {/* ── Step 1: Upload ── */}
      <div className="animate-fade-in-up animate-delay-100">
        <StepCard step={1} title="Upload Student Data" subtitle="JSON file or try the sample dataset" active={!step1Done} done={step1Done}>
          <FileUploader onStudentsLoaded={handleStudentsLoaded} onError={handleError} />
        </StepCard>
      </div>

      {/* ── Step 2: Preview ── */}
      <div className="animate-fade-in-up animate-delay-200">
        <StepCard step={2} title="Preview Students" subtitle="Review the uploaded data before generating" active={step1Done && !step3Done} done={step3Done}>
          {students.length > 0 ? (
            <StudentTable students={students} selectedGrade={selectedGrade ?? undefined} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Student data will appear here after upload</p>
            </div>
          )}
        </StepCard>
      </div>

      {/* ── Step 3: Select ── */}
      <div className="animate-fade-in-up animate-delay-300">
        <StepCard step={3} title="Select Document Type & Grade" subtitle="Choose what to generate and for which grade" active={step1Done && !step3Done} done={step3Done}>
          <TemplateSelector onSelect={handleSelect} selectedDocType={selectedDocType} selectedGrade={selectedGrade} />
        </StepCard>
      </div>

      {/* ── Generate ── */}
      <div className="card p-6">
        <GenerateButton
          students={students}
          docType={selectedDocType}
          grade={selectedGrade}
          onGenerateStart={handleGenerateStart}
          onProgress={handleProgress}
          onGenerateComplete={handleComplete}
          onError={handleError}
        />
        {showProgress && (
          <div className="mt-5">
            <ProgressBar
              current={progress.current}
              total={progress.total}
              currentStudentName={progress.currentStudentName}
              status={progress.status}
            />
          </div>
        )}
      </div>

      {/* ── Step 4: Download ── */}
      {showDownloads && (
        <div className="card p-6 step-done animate-fade-in-up">
          <div className="flex items-start gap-3 mb-6">
            <StepBadge step={4} active={false} done={true} />
            <div>
              <h2 className="font-semibold text-base text-emerald-700">Download Results</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your PDFs are ready</p>
            </div>
          </div>
          <DownloadLinks pdfs={generatedPDFs} />
        </div>
      )}
    </div>
  );
}

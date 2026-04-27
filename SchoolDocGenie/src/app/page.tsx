'use client';

import React, { useState } from 'react';
import { Student, DocType, GeneratedPDF, GenerationProgress } from '@/types';
import FileUploader from '@/components/FileUploader';
import StudentTable from '@/components/StudentTable';
import TemplateSelector from '@/components/TemplateSelector';
import GenerateButton from '@/components/GenerateButton';
import ProgressBar from '@/components/ProgressBar';
import DownloadLinks from '@/components/DownloadLinks';

function StepCard({
  step,
  title,
  active,
  done,
  children,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
        active ? 'border-blue-300 shadow-blue-50' : done ? 'border-green-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            done
              ? 'bg-green-500 text-white'
              : active
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {done ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            step
          )}
        </div>
        <h2 className={`font-semibold text-lg ${active ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-400'}`}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    currentStudentName: '',
    status: 'idle',
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

  const handleProgress = (current: number, total: number, name: string) => {
    setProgress({ current, total, currentStudentName: name, status: 'generating' });
  };

  const handleComplete = (pdfs: GeneratedPDF[]) => {
    setGeneratedPDFs(pdfs);
    setProgress((p) => ({ ...p, status: 'complete' }));
  };

  const handleError = (msg: string) => {
    setError(msg);
    setProgress((p) => ({ ...p, status: 'error', error: msg }));
  };

  const step1Done = students.length > 0;
  const step2Done = step1Done;
  const step3Done = selectedDocType !== null && selectedGrade !== null;
  const step4Active = progress.status === 'generating' || progress.status === 'complete';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          School<span className="text-blue-600">Doc</span>Genie
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Generate professional school documents for every student in seconds, powered by Google Gemini AI.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {['Marksheet', 'Leaving Certificate', 'Periodic Evaluation'].map((t) => (
            <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Gemini API key notice */}
      {!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'your_gemini_api_key_here' ? (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Gemini API key not set.</strong> PDFs will be generated using built-in remarks templates.
            Set <code className="px-1 py-0.5 bg-amber-100 rounded text-xs">NEXT_PUBLIC_GEMINI_API_KEY</code> in{' '}
            <code className="px-1 py-0.5 bg-amber-100 rounded text-xs">.env.local</code> for AI-powered remarks.
          </div>
        </div>
      ) : null}

      {/* Step 1 */}
      <StepCard step={1} title="Upload Student Data" active={!step1Done} done={step1Done}>
        <FileUploader onStudentsLoaded={handleStudentsLoaded} onError={handleError} />
      </StepCard>

      {/* Step 2 */}
      <StepCard step={2} title="Preview Students" active={step1Done && !step3Done} done={step3Done}>
        {students.length > 0 ? (
          <StudentTable students={students} selectedGrade={selectedGrade ?? undefined} />
        ) : (
          <p className="text-gray-400 text-sm">Upload a JSON file to preview student data here.</p>
        )}
      </StepCard>

      {/* Step 3 */}
      <StepCard step={3} title="Select Document Type & Grade" active={step1Done && !step3Done} done={step3Done}>
        <TemplateSelector
          onSelect={handleSelect}
          selectedDocType={selectedDocType}
          selectedGrade={selectedGrade}
        />
      </StepCard>

      {/* Generate */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <GenerateButton
          students={students}
          docType={selectedDocType}
          grade={selectedGrade}
          onGenerateStart={handleGenerateStart}
          onProgress={handleProgress}
          onGenerateComplete={handleComplete}
          onError={handleError}
        />

        {progress.status !== 'idle' && (
          <div className="mt-4">
            <ProgressBar
              current={progress.current}
              total={progress.total}
              currentStudentName={progress.currentStudentName}
              status={progress.status}
            />
          </div>
        )}
      </div>

      {/* Step 4 */}
      {generatedPDFs.length > 0 && (
        <StepCard step={4} title="Download Results" active={step4Active} done={false}>
          <DownloadLinks pdfs={generatedPDFs} />
        </StepCard>
      )}
    </div>
  );
}

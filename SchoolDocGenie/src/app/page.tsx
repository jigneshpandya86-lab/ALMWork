'use client';

import React, { useState, useEffect } from 'react';
import { Student, DocType, GeneratedPDF, GenerationProgress } from '@/types';
import FileUploader from '@/components/FileUploader';
import StudentTable from '@/components/StudentTable';
import TemplateSelector from '@/components/TemplateSelector';
import GenerateButton from '@/components/GenerateButton';
import ProgressBar from '@/components/ProgressBar';
import DownloadLinks from '@/components/DownloadLinks';
import { api } from '@/lib/firebase';

/* ── Step wrapper ─────────────────────────────────────────────────── */
function Step({
  n, title, subtitle, active, done, last = false, children, id,
}: {
  n: number; title: string; subtitle: string;
  active: boolean; done: boolean; last?: boolean;
  children: React.ReactNode; id?: string;
}) {
  return (
    <div className="flex gap-5" id={id}>
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300
          ${done ? 'text-white' : active ? 'text-white ring-4 ring-indigo-100' : 'bg-white text-slate-300 border border-slate-200'}`}
          style={done
            ? { background: 'linear-gradient(135deg,#059669,#10b981)' }
            : active ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' } : {}}>
          {done
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            : n}
        </div>
        {!last && (
          <div className={`w-0.5 flex-1 mt-2 rounded-full transition-all duration-500 ${done ? 'bg-emerald-200' : 'bg-slate-200'}`}
            style={{ minHeight: 24 }} />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-5 glass step-card transition-all duration-300
        ${active ? 'ring-2 ring-indigo-300 ring-offset-2' : done ? 'ring-1 ring-emerald-200' : 'opacity-80'}`}
        style={{ padding: '24px' }}>
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            {done && <span className="badge" style={{ background:'rgba(16,185,129,0.12)', color:'#059669' }}>Complete</span>}
            {active && <span className="badge" style={{ background:'rgba(79,70,229,0.12)', color:'#4f46e5' }}>Active</span>}
          </div>
          <h2 className={`font-bold text-lg leading-tight ${active ? 'text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'}`}>
            {title}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────── */
function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center px-3 py-2 border border-indigo-100/70" style={{ background: 'rgba(255,255,255,0.78)', borderRadius: 10 }}>
      <p className="text-sm font-black" style={{ background: color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-0 font-medium">{label}</p>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────── */
export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0, total: 0, currentStudentName: '', status: 'idle',
  });
  const [generatedPDFs, setPDFs] = useState<GeneratedPDF[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Fetch students from Firebase on mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const result = await api.getStudents();
        const data = result.data as { success: boolean, data: Student[] };
        if (data.success) {
          setStudents(data.data);
        }
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError("Could not connect to backend. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const handleStudentsLoaded = (loaded: Student[]) => {
    setStudents(loaded);
    setError(null);
    setGeneratedPDFs([]);
    setProgress({ current: 0, total: 0, currentStudentName: '', status: 'idle' });
  };

  const handleStudentsLoaded = (s: Student[]) => {
    setStudents((prev) => mergeStudents(prev, s));
    setError(null); setPDFs([]);
    setProgress({ current:0, total:0, currentStudentName:'', status:'idle' });
  };

  const handleSaveStudent = (student: Student, _mode: 'add' | 'edit') => {
    setStudents((prev) => mergeStudents(prev, [student]));
    setError(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };
  const handleSelect = (d: DocType, g: string) => {
    setDocType(d); setGrade(g); setPDFs([]);
    setProgress({ current:0, total:0, currentStudentName:'', status:'idle' });
  };
  const handleGenerateStart = () => {
    setPDFs([]); setError(null);
    setProgress({ current:0, total:0, currentStudentName:'', status:'generating' });
  };
  const handleProgress = (c: number, t: number, n: string) =>
    setProgress({ current:c, total:t, currentStudentName:n, status:'generating' });
  const handleComplete = (pdfs: GeneratedPDF[]) => {
    setPDFs(pdfs);
    setProgress(p => ({ ...p, status:'complete' }));
  };
  const handleError = (msg: string) => {
    setError(msg);
    setProgress(p => ({ ...p, status:'error', error:msg }));
  };

  return (
    <div className="space-y-5">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="hero-shell px-6 py-5 md:px-8 md:py-6 fade-up">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex-shrink-0">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
            <span className="text-slate-800">School</span>
            <span className="grad-text">Doc</span>
            <span className="text-slate-800">Genie</span>
          </h1>
          </div>

          <p className="text-slate-600 text-sm md:text-base font-medium flex-1 max-w-2xl">
            Create polished school documents in minutes — upload student data, select a document type, and generate downloadable PDFs instantly.
          </p>

          {/* Stats bar */}
          <div className="inline-flex gap-1 p-1 rounded-xl flex-shrink-0"
            style={{ background:'rgba(255,255,255,0.55)', border:'1px solid rgba(199,210,254,0.7)', backdropFilter:'blur(12px)' }}>
            <Stat value="3" label="Doc Types" color="linear-gradient(135deg,#4f46e5,#7c3aed)" />
            <Stat value="6–8" label="Grades" color="linear-gradient(135deg,#2563eb,#4f46e5)" />
            <Stat value="PDF" label="Instant" color="linear-gradient(135deg,#7c3aed,#c026d3)" />
            <Stat value="0%" label="Data Sent" color="linear-gradient(135deg,#059669,#10b981)" />
          </div>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className="glass fade-up flex items-start gap-3 px-5 py-4 rounded-2xl"
          style={{ background:'rgba(254,242,242,0.9)', border:'1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(239,68,68,0.1)' }}>
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-red-700"><strong>Error:</strong> {error}</p>
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
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-300">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
               <p className="text-sm">Connecting to Mumbai backend...</p>
            </div>
          ) : students.length > 0 ? (
            <StudentTable students={students} selectedGrade={selectedGrade ?? undefined} />
          ) : (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Student Data
            </button>
          )}
          {showUploadForm && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <FileUploader onStudentsLoaded={handleStudentsLoaded} onError={handleError} />
            </div>
          )}
        </Step>

        <Step id="step-preview" n={2} title="Student Master" subtitle="Review, add, edit, update, and delete students"
          active={step1Done && !step3Done} done={step3Done}>
          {students.length > 0
            ? (
              <StudentTable
                students={students}
                selectedGrade={selectedGrade ?? undefined}
                onSaveStudent={handleSaveStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            )
            : (
              <div className="flex flex-col items-center gap-3 py-10 text-slate-300 select-none">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Upload a file above to preview students here</p>
              </div>
            )}
        </Step>

        <Step id="step-select" n={3} title="Choose Document Type & Grade" subtitle="Pick what to generate and for which grade"
          active={step1Done && !step3Done} done={step3Done}>
          <TemplateSelector onSelect={handleSelect} selectedDocType={selectedDocType} selectedGrade={selectedGrade} />
        </Step>

        <Step id="step-generate" n={4} title="Generate & Download" subtitle="Click to create PDFs for all students in the selected grade"
          active={step3Done} done={generatedPDFs.length > 0} last>
          <GenerateButton
            students={students} docType={selectedDocType} grade={selectedGrade}
            onGenerateStart={handleGenerateStart} onProgress={handleProgress}
            onGenerateComplete={handleComplete} onError={handleError}
          />
          {progress.status !== 'idle' && (
            <div className="mt-5 pt-5" style={{ borderTop:'1px solid rgba(199,210,254,0.4)' }}>
              <ProgressBar
                current={progress.current} total={progress.total}
                currentStudentName={progress.currentStudentName} status={progress.status}
              />
            </div>
          )}
          {generatedPDFs.length > 0 && (
            <div className="mt-5 pt-5" style={{ borderTop:'1px solid rgba(199,210,254,0.4)' }}>
              <DownloadLinks pdfs={generatedPDFs} />
            </div>
          )}
        </Step>
      </div>
    </div>
  );
}

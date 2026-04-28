'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Student, DocType, GeneratedPDF, GenerationProgress } from '@/types';
import FileUploader from '@/components/FileUploader';
import StudentTable from '@/components/StudentTable';
import TemplateSelector from '@/components/TemplateSelector';
import GenerateButton from '@/components/GenerateButton';
import ProgressBar from '@/components/ProgressBar';
import DownloadLinks from '@/components/DownloadLinks';
import { api } from '@/lib/firebase';

function mergeStudents(existing: Student[], incoming: Student[]) {
  const merged = new Map<string, Student>();

  existing.forEach((student) => {
    if (student.id) {
      merged.set(student.id, student);
    }
  });

  incoming.forEach((student) => {
    if (student.id) {
      merged.set(student.id, student);
    }
  });

  return Array.from(merged.values());
}

function Step({
  n, title, subtitle, active, done, children, id, icon,
}: {
  n: number;
  title: string;
  subtitle: string;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
  id?: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`glass step-card h-full flex flex-col transition-all duration-300 rounded-[24px] overflow-hidden
      ${active ? 'ring-2 ring-indigo-300 ring-offset-2' : done ? 'ring-1 ring-emerald-200' : 'opacity-95'}`}
      id={id}
    >
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-indigo-100/70">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 flex-shrink-0
              ${done ? 'text-white' : active ? 'text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
            style={
              done
                ? { background: 'linear-gradient(135deg,#059669,#10b981)' }
                : active
                  ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
                  : {}
            }
          >
            {done ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              icon
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-bold text-slate-400">Step {n}</span>
            {done && (
              <span className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
                Complete
              </span>
            )}
            {active && (
              <span className="badge" style={{ background: 'rgba(79,70,229,0.12)', color: '#4f46e5' }}>
                Active
              </span>
            )}
            </div>
            <h2 className={`font-bold text-sm sm:text-base leading-tight ${active ? 'text-slate-900' : done ? 'text-slate-700' : 'text-slate-500'}`}>
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    currentStudentName: '',
    status: 'idle',
  });
  const [generatedPDFs, setPDFs] = useState<GeneratedPDF[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const result = await api.getStudents();
        const data = result.data as { success: boolean; data: Student[] };
        if (data.success) {
          setStudents(data.data);
        }
      } catch (err: unknown) {
        console.error('Error fetching students:', err);
        setError('Could not connect to backend. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const step1Done = students.length > 0;
  const step3Done = step1Done && Boolean(selectedDocType && selectedGrade);

  const handleStudentsLoaded = async (newStudents: Student[]) => {
    try {
      setLoading(true);
      const result = await api.bulkCreateStudents(newStudents);
      const data = result.data as { success: boolean; data: Student[] };
      if (data.success) {
        setStudents((prev) => mergeStudents(prev, data.data));
      }
      setError(null);
      setPDFs([]);
      setProgress({ current: 0, total: 0, currentStudentName: '', status: 'idle' });
      setShowUploadForm(false);
    } catch (err: unknown) {
      console.error('Error uploading students:', err);
      setError('Failed to save students to the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (student: Student, mode: 'add' | 'edit') => {
    try {
      setLoading(true);
      if (mode === 'add') {
        const result = await api.createStudent(student);
        const data = result.data as { success: boolean; data: Student };
        if (data.success) {
          setStudents((prev) => mergeStudents(prev, [data.data]));
        }
      } else if (student.id) {
        const result = await api.updateStudent({ id: student.id, updates: student });
        const data = result.data as { success: boolean; data: Student };
        if (data.success) {
          setStudents((prev) => mergeStudents(prev, [data.data]));
        }
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error saving student:', err);
      setError('Failed to save student change to the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const result = await api.deleteStudent({ id: studentId });
      const data = result.data as { success: boolean };
      if (data.success) {
        setStudents((prev) => prev.filter((student) => student.id !== studentId));
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student from the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDeleteStudents = async (studentIds: string[]) => {
    try {
      setLoading(true);
      const result = await api.bulkDeleteStudents({ ids: studentIds });
      const data = result.data as { success: boolean };
      if (data.success) {
        setStudents((prev) => prev.filter((student) => !studentIds.includes(student.id)));
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error bulk deleting students:', err);
      setError('Failed to delete selected students from the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (docType: DocType, grade: string) => {
    setSelectedDocType(docType);
    setSelectedGrade(grade);
    setPDFs([]);
    setProgress({ current: 0, total: 0, currentStudentName: '', status: 'idle' });
  };

  const handleGenerateStart = () => {
    setPDFs([]);
    setError(null);
    setProgress({ current: 0, total: 0, currentStudentName: '', status: 'generating' });
  };

  const handleProgress = (current: number, total: number, currentStudentName: string) => {
    setProgress({ current, total, currentStudentName, status: 'generating' });
  };

  const handleComplete = (pdfs: GeneratedPDF[]) => {
    setPDFs(pdfs);
    setProgress((previous) => ({ ...previous, status: 'complete' }));
  };

  const handleError = (message: string) => {
    setError(message);
    setProgress((previous) => ({ ...previous, status: 'error', error: message }));
  };

  const filteredCount = useMemo(() => {
    if (!selectedGrade) {
      return students.length;
    }
    return students.filter((student) => student.grade === selectedGrade).length;
  }, [selectedGrade, students]);

  return (
    <div className="space-y-5">
      <section className="glass px-5 py-4 rounded-2xl fade-up delay-1">
        <div className="flex flex-wrap gap-3 items-center text-sm text-slate-700">
          <span className="badge" style={{ background: 'rgba(79,70,229,0.12)', color: '#4f46e5' }}>
            {loading ? 'Syncing roster...' : `Roster synced: ${students.length} students`}
          </span>
          {selectedGrade && <span>Selected grade has {filteredCount} students.</span>}
          {selectedDocType && <span>Document type selected and ready to generate.</span>}
        </div>
      </section>

      {error && (
        <div className="glass fade-up flex items-start gap-3 px-5 py-4 rounded-2xl" style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <div className="mt-4 fade-up delay-2 grid grid-cols-2 gap-3 sm:gap-4 h-[calc(100vh-220px)] min-h-[560px]">
        <Step
          id="step-upload"
          n={1}
          title="Upload Student Data"
          subtitle="JSON file, paste JSON, or load the built-in sample dataset"
          active={!step1Done}
          done={step1Done}
          icon={<span className="text-sm sm:text-base">⬆️</span>}
        >
          {step1Done ? (
            <div className="flex items-center gap-3 py-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">{students.length} students loaded</span>
              <button onClick={() => setShowUploadForm((previous) => !previous)} className="ml-auto px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                {showUploadForm ? 'Hide' : 'Add More'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowUploadForm((previous) => !previous)}
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

        <Step
          id="step-preview"
          n={2}
          title="Student Master"
          subtitle="Review, add, edit, update, and delete students"
          active={step1Done && !step3Done}
          done={step3Done}
          icon={<span className="text-sm sm:text-base">👩‍🎓</span>}
        >
          {students.length > 0 ? (
            <StudentTable
              students={students}
              selectedGrade={selectedGrade ?? undefined}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkDeleteStudents={handleBulkDeleteStudents}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-300 select-none">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm">Upload a file above to preview students here</p>
            </div>
          )}
        </Step>

        <Step
          id="step-select"
          n={3}
          title="Choose Document Type & Grade"
          subtitle="Pick what to generate and for which grade"
          active={step1Done && !step3Done}
          done={step3Done}
          icon={<span className="text-sm sm:text-base">📄</span>}
        >
          <TemplateSelector onSelect={handleSelect} selectedDocType={selectedDocType} selectedGrade={selectedGrade} />
        </Step>

        <Step
          id="step-generate"
          n={4}
          title="Generate & Download"
          subtitle="Click to create PDFs for all students in the selected grade"
          active={step3Done}
          done={generatedPDFs.length > 0}
          icon={<span className="text-sm sm:text-base">✨</span>}
        >
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
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(199,210,254,0.4)' }}>
              <ProgressBar current={progress.current} total={progress.total} currentStudentName={progress.currentStudentName} status={progress.status} />
            </div>
          )}
          {generatedPDFs.length > 0 && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(199,210,254,0.4)' }}>
              <DownloadLinks pdfs={generatedPDFs} />
            </div>
          )}
        </Step>
      </div>
    </div>
  );
}

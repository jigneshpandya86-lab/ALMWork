'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import JSZip from 'jszip';
import { Student, DocType, GeneratedPDF, GenerationProgress, CsvRow, ReportBlueprint } from '@/types';
import FileUploader from '@/components/FileUploader';
import StudentTable from '@/components/StudentTable';
import TemplateSelector from '@/components/TemplateSelector';
import GenerateButton from '@/components/GenerateButton';
import ProgressBar from '@/components/ProgressBar';
import DownloadLinks from '@/components/DownloadLinks';
import { api } from '@/lib/firebase';
import MasterReportTemplate from '@/components/MasterReportTemplate';
import { parseCSVAndMap } from '@/lib/csvParser';
import BatchTemplateSelector from '@/components/BatchTemplateSelector';
import BatchCsvUploader from '@/components/BatchCsvUploader';
import BatchProgressBar from '@/components/BatchProgressBar';



type ReportDesignFile = {
  reports: ReportBlueprint[];
};

async function renderBlueprintRowToPdfBlob(blueprint: ReportBlueprint, row: CsvRow): Promise<Blob> {
  const [html2canvasModule, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const html2canvas = html2canvasModule.default;

  const mount = document.createElement('div');
  mount.style.position = 'fixed';
  mount.style.left = '-99999px';
  mount.style.top = '0';
  mount.style.background = '#fff';
  mount.style.width = blueprint.layout === 'landscape' ? '1123px' : '794px';
  document.body.appendChild(mount);

  const root = createRoot(mount);
  try {
    root.render(<MasterReportTemplate blueprint={blueprint} parsedCsvData={[row]} />);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    await new Promise((resolve) => setTimeout(resolve, 80));

    const target = mount.firstElementChild as HTMLElement | null;
    if (!target) throw new Error('Failed to render template for PDF generation.');

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });

    const orientation = blueprint.layout === 'landscape' ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imageData = canvas.toDataURL('image/png');
    const renderedHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, renderedHeight, undefined, 'FAST');
    return pdf.output('blob');
  } finally {
    root.unmount();
    mount.remove();
  }
}

function safeFilePart(value: unknown, fallback: string): string {
  const raw = String(value ?? fallback).trim();
  return raw.replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/_+/g, '_') || fallback;
}

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
  n, title, subtitle, active, done, last = false, children, id,
}: {
  n: number;
  title: string;
  subtitle: string;
  active: boolean;
  done: boolean;
  last?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex gap-5" id={id}>
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300
          ${done ? 'text-white' : active ? 'text-white ring-4 ring-indigo-100' : 'bg-white text-slate-300 border border-slate-200'}`}
          style={
            done
              ? { background: 'linear-gradient(135deg,#059669,#10b981)' }
              : active
                ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
                : {}
          }
        >
          {done ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            n
          )}
        </div>
        {!last && (
          <div
            className={`w-0.5 flex-1 mt-2 rounded-full transition-all duration-500 ${done ? 'bg-emerald-200' : 'bg-slate-200'}`}
            style={{ minHeight: 24 }}
          />
        )}
      </div>

      <div
        className={`flex-1 mb-5 glass step-card transition-all duration-300
        ${active ? 'ring-2 ring-indigo-300 ring-offset-2' : done ? 'ring-1 ring-emerald-200' : 'opacity-80'}`}
        style={{ padding: '24px' }}
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
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
  const [batchTemplateKey, setBatchTemplateKey] = useState('');
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchStatus, setBatchStatus] = useState('Ready');
  const [batchPercent, setBatchPercent] = useState(0);

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


  const handleBatchGenerate = async () => {
    if (!batchTemplateKey || !batchFile) {
      setError('Please select a batch template and upload a CSV file.');
      return;
    }

    try {
      setBatchGenerating(true);
      setBatchStatus('Parsing CSV...');
      setBatchPercent(2);

      const response = await fetch('data/templates/report_designs.json');
      if (!response.ok) throw new Error('Unable to load report designs JSON.');
      const designData = (await response.json()) as ReportDesignFile;
      const blueprint = designData.reports.find((report) => report.id === batchTemplateKey);
      if (!blueprint) throw new Error('Selected batch template was not found.');

      const { csvData, mappedBlueprint } = await parseCSVAndMap(batchFile, blueprint);
      if (!csvData.length) throw new Error('CSV has no valid rows.');

      const zip = new JSZip();
      const totalRows = csvData.length;
      let index = 0;
      for (const row of csvData) {
        setBatchStatus(`Generating ${index + 1} of ${totalRows}...`);
        setBatchPercent(Math.round(((index + 1) / totalRows) * 92));

        const blob = await renderBlueprintRowToPdfBlob(mappedBlueprint, row);
        const rollNo = safeFilePart(row.roll_no ?? row.rollno, `row_${index + 1}`);
        const name = safeFilePart(row.name, 'student');
        zip.file(`${rollNo}_${name}.pdf`, blob);

        await new Promise((resolve) => setTimeout(resolve, 150));
        index += 1;
      }

      setBatchStatus('Compressing Files...');
      setBatchPercent(97);
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Batch_Reports.zip';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setBatchStatus('Complete!');
      setBatchPercent(100);
    } catch (err: unknown) {
      setBatchStatus('Failed.');
      setError(err instanceof Error ? err.message : 'Batch generation failed.');
    } finally {
      setBatchGenerating(false);
    }
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

      <div className="mt-4 fade-up delay-2">
        <Step
          id="step-upload"
          n={1}
          title="Upload Student Data"
          subtitle="JSON file, paste JSON, or load the built-in sample dataset"
          active={!step1Done}
          done={step1Done}
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

        <Step id="step-preview" n={2} title="Student Master" subtitle="Review, add, edit, update, and delete students" active={step1Done && !step3Done} done={step3Done}>
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

        <Step id="step-select" n={3} title="Choose Document Type & Grade" subtitle="Pick what to generate and for which grade" active={step1Done && !step3Done} done={step3Done}>
          <TemplateSelector onSelect={handleSelect} selectedDocType={selectedDocType} selectedGrade={selectedGrade} />
        </Step>

        <Step id="step-generate" n={4} title="Generate & Download" subtitle="Click to create PDFs for all students in the selected grade" active={step3Done} done={generatedPDFs.length > 0} last>
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

        <Step
          id="step-batch"
          n={5}
          title="CSV Blueprint Batch (Add-on)"
          subtitle="Generate JSON-blueprint PDFs from CSV and download as one ZIP"
          active={Boolean(batchTemplateKey || batchFile)}
          done={batchStatus === 'Complete!'}
          last
        >
          <div className="space-y-4">
            <BatchTemplateSelector value={batchTemplateKey} onChange={setBatchTemplateKey} />
            <BatchCsvUploader file={batchFile} onChange={setBatchFile} />
            <button
              type="button"
              onClick={handleBatchGenerate}
              disabled={batchGenerating}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-medium disabled:opacity-60"
            >
              {batchGenerating ? 'Generating ZIP...' : 'Generate Blueprint ZIP'}
            </button>
            <BatchProgressBar status={batchStatus} percentage={batchPercent} />
          </div>
        </Step>

      </div>
    </div>
  );
}

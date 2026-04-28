import React from 'react';
import { createRoot } from 'react-dom/client';
import { Student, GeneratedPDF } from '@/types';
import { generateFileName } from './utils';
import {
  AttendanceTemplate,
  LeavingCertTemplate,
  MarksheetTemplate,
  PeriodicEvalTemplate,
} from '@/components/pdfTemplates';

const SCHOOL = {
  name: 'Vidya Mandir School',
  address: '123, Knowledge Street, Education Nagar, Gujarat — 380001',
  phone: '+91 79 1234 5678',
  email: 'info@vidyamandir.edu.in',
  academicYear: '2025-2026',
  affiliation: 'GSEB',
  evaluationPeriod: 'Term 1',
};

type DocumentType = unknown;

async function renderElementToPDFBlob(element: React.ReactElement, orientation: 'portrait' | 'landscape' = 'portrait'): Promise<Blob> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('PDF generation requires a browser environment.');
  }

  const [html2canvasModule, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const html2canvas = html2canvasModule.default;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.style.background = '#fff';
  container.style.width = orientation === 'portrait' ? '794px' : '1123px';

  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(element);

    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    await new Promise((resolve) => setTimeout(resolve, 80));
    await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;

    const target = container.firstElementChild as HTMLElement | null;
    if (!target) throw new Error('Failed to render template for PDF generation.');

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const renderedHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, renderedHeight, undefined, 'FAST');

    if (renderedHeight > pageHeight) {
      let remainingHeight = renderedHeight - pageHeight;
      let position = -pageHeight;
      while (remainingHeight > 0) {
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, renderedHeight, undefined, 'FAST');
        remainingHeight -= pageHeight;
        position -= pageHeight;
      }
    }

    return pdf.output('blob');
  } finally {
    root.unmount();
    container.remove();
  }
}

async function generateMarksheetPDF(student: Student, remarks: string): Promise<Blob> {
  return renderElementToPDFBlob(React.createElement(MarksheetTemplate, { student, remarks, school: SCHOOL }));
}

async function generateLeavingCertPDF(student: Student, remarks: string): Promise<Blob> {
  return renderElementToPDFBlob(React.createElement(LeavingCertTemplate, { student, remarks, school: SCHOOL }));
}

async function generatePeriodicEvalPDF(student: Student, remarks: string): Promise<Blob> {
  return renderElementToPDFBlob(React.createElement(PeriodicEvalTemplate, { student, remarks, school: SCHOOL }));
}

async function generateSingleStudentAttendancePDF(student: Student, attendance: string): Promise<Blob> {
  const days = Array.from({ length: 30 }, () => true);
  const attendanceMap = new Map<string, { month: number; year: number; days: boolean[] }>([
    [student.id, { month: new Date().getMonth(), year: new Date().getFullYear(), days }],
  ]);

  return renderElementToPDFBlob(
    React.createElement(AttendanceTemplate, {
      students: [student],
      attendanceData: attendanceMap,
      grade: student.grade,
      school: SCHOOL,
    }),
    'landscape'
  );
}

async function generateAttendanceRegisterPDF(
  students: Student[],
  attendanceData: Map<string, { month: number; year: number; days: boolean[] }>,
  grade: string
): Promise<Blob> {
  return renderElementToPDFBlob(
    React.createElement(AttendanceTemplate, {
      students,
      attendanceData,
      grade,
      school: SCHOOL,
    }),
    'landscape'
  );
}

export async function generatePDF(student: Student, remarks: string, docType: string): Promise<Blob> {
  if (docType === 'marksheet') return generateMarksheetPDF(student, remarks);
  if (docType === 'leavingCert') return generateLeavingCertPDF(student, remarks);
  if (docType === 'attendanceRegister') return generateSingleStudentAttendancePDF(student, remarks);
  return generatePeriodicEvalPDF(student, remarks);
}

export async function generateMultiplePDFs(
  students: Student[],
  documents: Map<string, string>,
  docType: string,
  onProgress?: (current: number, total: number, name: string) => void,
  attendanceData?: Map<string, { month: number; year: number; days: boolean[] }>,
  template?: DocumentType,
  grade?: string
): Promise<GeneratedPDF[]> {
  void template;
  const results: GeneratedPDF[] = [];

  if (docType === 'attendanceRegister' && attendanceData && grade) {
    onProgress?.(1, 1, `Grade ${grade} Attendance Register`);
    const blob = await generateAttendanceRegisterPDF(students, attendanceData, grade);
    const firstStudentData = students[0] ? attendanceData.get(students[0].id) : undefined;
    const fileMonth = (firstStudentData?.month ?? new Date().getMonth()) + 1;
    const fileYear = firstStudentData?.year ?? new Date().getFullYear();
    results.push({
      studentId: `Grade${grade}`,
      studentName: `Grade ${grade} Attendance Register`,
      filename: `Attendance_Register_Grade${grade}_${fileMonth}_${fileYear}.pdf`,
      blob,
      size: blob.size,
    });

    return results;
  }

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    onProgress?.(i + 1, students.length, student.name);

    const text = documents.get(student.id) ?? '';
    const blob = await generatePDF(student, text, docType);
    const filename = generateFileName(student, docType);

    results.push({
      studentId: student.id,
      studentName: student.name,
      filename,
      blob,
      size: blob.size,
    });
  }

  return results;
}

export function downloadPDF(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

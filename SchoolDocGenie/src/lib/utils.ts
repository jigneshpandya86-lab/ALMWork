import { Student } from '@/types';

export function calculatePercentage(marks: { [subject: string]: number }): number {
  const values = Object.values(marks);
  if (values.length === 0) return 0;
  const total = values.reduce((sum, m) => sum + m, 0);
  return Math.round((total / (values.length * 100)) * 100 * 10) / 10;
}

export function getGradePoint(percentage: number): string {
  if (percentage >= 95) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 65) return 'B';
  if (percentage >= 55) return 'C+';
  if (percentage >= 45) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function generateFileName(student: Student, docType: string): string {
  const safeName = student.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const label = docType === 'marksheet' ? 'Marksheet'
    : docType === 'leavingCert' ? 'LeavingCert'
    : docType === 'attendanceRegister' ? 'Attendance'
    : 'PeriodicEval';
  return `${safeName}_Grade${student.grade}_${label}.pdf`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function subjectLabel(key: string): string {
  const map: { [k: string]: string } = {
    hindi: 'Hindi', english: 'English', mathematics: 'Mathematics',
    science: 'Science', socialStudies: 'Social Studies',
  };
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

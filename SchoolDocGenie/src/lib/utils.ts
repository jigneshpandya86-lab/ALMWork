import { Student, DocumentTemplate } from '@/types';

export function calculatePercentage(marks: { [subject: string]: number }): number {
  const values = Object.values(marks);
  if (values.length === 0) return 0;
  const total = values.reduce((sum, m) => sum + m, 0);
  const max = values.length * 100;
  return Math.round((total / max) * 100 * 10) / 10;
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

export function getRemarks(percentage: number, template: DocumentTemplate): string {
  if (!template.remarksRules) return '';
  const rules = template.remarksRules;

  if (percentage >= 90 && rules['90-100']) return rules['90-100'];
  if (percentage >= 80 && rules['80-89']) return rules['80-89'];
  if (percentage >= 70 && rules['70-79']) return rules['70-79'];
  if (percentage >= 60 && rules['60-69']) return rules['60-69'];
  return rules['below-60'] ?? '';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function buildPrompt(template: DocumentTemplate, student: Student, grade: string): string {
  const rawPrompt = template.aiPrompts[grade] ?? template.aiPrompts['6'] ?? '';
  return rawPrompt
    .replace(/{name}/g, student.name)
    .replace(/{rollno}/g, student.rollno)
    .replace(/{grade}/g, student.grade)
    .replace(/{percentage}/g, String(student.percentage))
    .replace(/{gradePoint}/g, student.gradePoint)
    .replace(/{conduct}/g, student.conduct)
    .replace(/{attendance}/g, String(student.attendance))
    .replace(/{fatherName}/g, student.fatherName)
    .replace(/{motherName}/g, student.motherName)
    .replace(/{address}/g, student.address);
}

export function generateFileName(student: Student, docType: string): string {
  const safeName = student.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const docLabel =
    docType === 'marksheet'
      ? 'Marksheet'
      : docType === 'leavingCert'
      ? 'LeavingCert'
      : docType === 'attendanceRegister'
      ? 'Attendance'
      : 'PeriodicEval';
  return `${safeName}_Grade${student.grade}_${docLabel}.pdf`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function subjectLabel(key: string): string {
  const map: { [k: string]: string } = {
    hindi: 'Hindi',
    english: 'English',
    mathematics: 'Mathematics',
    science: 'Science',
    socialStudies: 'Social Studies',
  };
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

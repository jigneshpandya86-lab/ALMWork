import { Student } from '@/types';
import { calculatePercentage, getGradePoint } from './utils';

export function parseTextFormat(text: string): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) throw new Error('No data provided');

  if (lines[0].includes('\t')) {
    return parseDelimitedText(text, '\t');
  }

  if (lines[0].includes(',')) {
    return parseDelimitedText(text, ',');
  }

  // Pipe separated or custom positional format
  return parseTabSeparated(text);
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseDelimitedText(text: string, delimiter: ',' | '\t'): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const firstRow = lines[0].split(delimiter).map(v => v.trim());
  const isHeaderRow = firstRow.some((value) => {
    const normalized = normalizeHeader(value);
    return ['name', 'rollno', 'rollnumber', 'grade', 'gender', 'attendance', 'hindi', 'english'].includes(normalized);
  });

  if (isHeaderRow) {
    const headers = firstRow.map(normalizeHeader);
    return lines.slice(1).map((line, idx) => {
      const values = line.split(delimiter).map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return buildStudent(row, idx);
    });
  }

  return lines.map((line, idx) => {
    const parts = line.split(delimiter).map(p => p.trim());
    return buildStudentFromParts(parts, idx);
  });
}

function parseTabSeparated(text: string): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim());

  return lines.map((line, idx) => {
    const parts = line.split('|').map(p => p.trim());
    return buildStudentFromParts(parts, idx);
  });
}

function buildStudentFromParts(parts: string[], idx: number): Student {
  const row = {
    name: parts[0] || '',
    rollno: parts[1] || '',
    grade: parts[2] || '',
    gender: parts[3] || '',
    caste: parts[4] || '',
    dateOfBirth: parts[5] || '',
    fatherName: parts[6] || '',
    motherName: parts[7] || '',
    address: parts[8] || '',
    hindi: parts[9] || '0',
    english: parts[10] || '0',
    mathematics: parts[11] || '0',
    science: parts[12] || '0',
    socialStudies: parts[13] || '0',
    conduct: parts[14] || 'Good',
    attendance: parts[15] || '0',
  };
  return buildStudent(row, idx);
}

function buildStudent(row: Record<string, any>, idx: number): Student {
  const marks = {
    hindi: parseInt(row.hindi || row['hindi marks'] || '0') || 0,
    english: parseInt(row.english || row['english marks'] || '0') || 0,
    mathematics: parseInt(row.mathematics || row['math marks'] || row['maths marks'] || '0') || 0,
    science: parseInt(row.science || row['science marks'] || '0') || 0,
    socialStudies: parseInt(row.socialstudies || row['social studies'] || row['social studies marks'] || '0') || 0,
  };

  const totalMarks = Object.values(marks).reduce((a, b) => a + b, 0);
  const percentage = calculatePercentage(marks);

  return {
    id: `${Date.now()}-${idx}`,
    name: row.name?.trim() || '',
    rollno: String(row.rollno || row['roll no'] || '').trim(),
    grade: String(row.grade || '').trim(),
    gender: String(row.gender || '').trim(),
    caste: String(row.caste || '').trim(),
    dateOfBirth: row.dateofbirth || row['date of birth'] || '',
    fatherName: row.fathername || row['father name'] || '',
    motherName: row.mothername || row['mother name'] || '',
    address: row.address || '',
    marks,
    totalMarks,
    percentage,
    gradePoint: getGradePoint(percentage),
    conduct: row.conduct || 'Good',
    attendance: parseInt(row.attendance || '0') || 0,
  };
}

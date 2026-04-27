import { Student } from '@/types';
import { calculatePercentage, getGradePoint } from './utils';

export function parseTextFormat(text: string): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) throw new Error('No data provided');

  // Try to auto-detect format
  if (lines[0].includes(',')) {
    return parseCSVText(text);
  }

  // Tab/pipe separated or custom format
  return parseTabSeparated(text);
}

function parseCSVText(text: string): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, any> = {};

    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });

    return buildStudent(row, idx);
  });
}

function parseTabSeparated(text: string): Student[] {
  const lines = text.trim().split('\n').filter(l => l.trim());

  return lines.map((line, idx) => {
    const parts = line.split(/[\t|]+/).map(p => p.trim());

    const row = {
      name: parts[0] || '',
      rollno: parts[1] || '',
      grade: parts[2] || '',
      dateOfBirth: parts[3] || '',
      fatherName: parts[4] || '',
      motherName: parts[5] || '',
      address: parts[6] || '',
      hindi: parts[7] || '0',
      english: parts[8] || '0',
      mathematics: parts[9] || '0',
      science: parts[10] || '0',
      socialStudies: parts[11] || '0',
      conduct: parts[12] || 'Good',
      attendance: parts[13] || '0',
    };

    return buildStudent(row, idx);
  });
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

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Student, ValidationResult } from '@/types';
import { calculatePercentage, getGradePoint } from './utils';

export async function parseCSV(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const students = (results.data as Record<string, any>[]).map((row, idx) => ({
            id: `${Date.now()}-${idx}`,
            name: row.name?.trim() || '',
            rollno: String(row.rollno || row['roll no'] || '').trim(),
            grade: String(row.grade || '').trim(),
            dateOfBirth: row.dateOfBirth || row['date of birth'] || '',
            fatherName: row.fatherName || row['father name'] || '',
            motherName: row.motherName || row['mother name'] || '',
            address: row.address || '',
            marks: parseMarks(row),
            totalMarks: 0,
            percentage: 0,
            gradePoint: '',
            conduct: row.conduct || 'Good',
            attendance: parseInt(row.attendance || '0') || 0,
          }));

          students.forEach(s => {
            s.totalMarks = Object.values(s.marks).reduce((a, b) => a + b, 0);
            s.percentage = calculatePercentage(s.marks);
            s.gradePoint = getGradePoint(s.percentage);
          });

          resolve(students);
        } catch (err) {
          reject(err);
        }
      },
      error: reject,
    });
  });
}

export async function parseExcel(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        const students = rows.map((row, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: row.name?.trim() || '',
          rollno: String(row.rollno || row['roll no'] || '').trim(),
          grade: String(row.grade || '').trim(),
          dateOfBirth: row.dateOfBirth || row['date of birth'] || '',
          fatherName: row.fatherName || row['father name'] || '',
          motherName: row.motherName || row['mother name'] || '',
          address: row.address || '',
          marks: parseMarks(row),
          totalMarks: 0,
          percentage: 0,
          gradePoint: '',
          conduct: row.conduct || 'Good',
          attendance: parseInt(row.attendance || '0') || 0,
        }));

        students.forEach(s => {
          s.totalMarks = Object.values(s.marks).reduce((a, b) => a + b, 0);
          s.percentage = calculatePercentage(s.marks);
          s.gradePoint = getGradePoint(s.percentage);
        });

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseMarks(row: Record<string, any>): { [subject: string]: number } {
  const marks: { [key: string]: number } = {};
  const subjects = ['hindi', 'english', 'mathematics', 'science', 'socialStudies'];

  subjects.forEach(subj => {
    const val = row[subj] || row[subj.toLowerCase()] || 0;
    marks[subj] = parseInt(val) || 0;
  });

  return marks;
}

export function generateSampleCSV(): string {
  const headers = ['name', 'rollno', 'grade', 'dateOfBirth', 'fatherName', 'motherName', 'address', 'hindi', 'english', 'mathematics', 'science', 'socialStudies', 'conduct', 'attendance'];
  const sampleData = [
    ['Aarjun Patel', '101', '6', '2012-05-15', 'Rajesh Patel', 'Priya Patel', '123 Main St', '85', '90', '88', '92', '87', 'Excellent', '95'],
    ['Bhavna Shah', '102', '6', '2012-08-22', 'Vikram Shah', 'Neha Shah', '456 Oak Ave', '78', '82', '80', '85', '79', 'Good', '92'],
    ['Chirag Desai', '103', '7', '2011-03-10', 'Amit Desai', 'Sneha Desai', '789 Pine Rd', '92', '95', '94', '97', '93', 'Excellent', '98'],
    ['Diya Gupta', '104', '7', '2011-11-05', 'Arjun Gupta', 'Pooja Gupta', '321 Elm St', '88', '91', '89', '93', '90', 'Excellent', '96'],
    ['Eshan Mehta', '105', '8', '2010-07-20', 'Suresh Mehta', 'Anjali Mehta', '654 Birch Ln', '75', '78', '76', '80', '77', 'Good', '88'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadSampleCSV(): void {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-students.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

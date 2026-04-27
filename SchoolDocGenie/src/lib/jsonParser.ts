import { Student, ValidationResult } from '@/types';
import { calculatePercentage, getGradePoint } from './utils';

export function parseJSON(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        const arr = Array.isArray(data) ? data : data.students ?? [];
        const { valid, errors } = validateStudents(arr);

        if (errors.length > 0 && valid.length === 0) {
          reject(new Error(`Invalid JSON format:\n${errors.slice(0, 3).join('\n')}`));
          return;
        }

        resolve(valid);
      } catch {
        reject(new Error('Invalid JSON file. Please check the file format.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

export function validateStudents(data: unknown[]): ValidationResult {
  const valid: Student[] = [];
  const errors: string[] = [];

  data.forEach((item, idx) => {
    const row = item as Record<string, unknown>;
    if (!row || typeof row !== 'object') {
      errors.push(`Row ${idx + 1}: Not an object`);
      return;
    }

    if (!row.name || typeof row.name !== 'string') {
      errors.push(`Row ${idx + 1}: Missing or invalid 'name'`);
      return;
    }

    if (!row.grade || !['6', '7', '8'].includes(String(row.grade))) {
      errors.push(`Row ${idx + 1} (${row.name}): 'grade' must be 6, 7, or 8`);
      return;
    }

    const marks =
      typeof row.marks === 'object' && row.marks !== null
        ? (row.marks as { [k: string]: number })
        : {};

    const percentage =
      typeof row.percentage === 'number'
        ? row.percentage
        : calculatePercentage(marks);

    const student: Student = {
      id: String(row.id ?? `STU_${String(idx + 1).padStart(3, '0')}`),
      name: String(row.name),
      rollno: String(row.rollno ?? idx + 1),
      grade: String(row.grade),
      gender: String(row.gender ?? ''),
      caste: String(row.caste ?? ''),
      dateOfBirth: String(row.dateOfBirth ?? ''),
      fatherName: String(row.fatherName ?? ''),
      motherName: String(row.motherName ?? ''),
      address: String(row.address ?? ''),
      marks,
      totalMarks: typeof row.totalMarks === 'number' ? row.totalMarks : Object.values(marks).reduce((s, v) => s + v, 0),
      percentage,
      gradePoint: String(row.gradePoint ?? getGradePoint(percentage)),
      conduct: String(row.conduct ?? 'Good'),
      attendance: typeof row.attendance === 'number' ? row.attendance : 0,
      remarks: typeof row.remarks === 'string' ? row.remarks : undefined,
    };

    valid.push(student);
  });

  return { valid, errors };
}

export function filterByGrade(students: Student[], grade: string): Student[] {
  return students.filter((s) => s.grade === grade);
}

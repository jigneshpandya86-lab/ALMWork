import { Student } from '@/types';

export function getRemark(student: Student, docType: string): string {
  const { percentage, gradePoint, name, conduct } = student;
  const conductNote = conduct === 'Excellent' ? ' Exemplary conduct throughout.'
    : conduct === 'Good' ? ' Good conduct maintained.' : '';

  if (docType === 'attendanceRegister') {
    return `${student.attendance}`;
  }

  if (docType === 'leavingCert') {
    if (percentage >= 80)
      return `${name} has been a dedicated student demonstrating exceptional academic ability with ${gradePoint} grade.${conductNote} We wish them continued success in all future endeavors.`;
    if (percentage >= 60)
      return `${name} has shown satisfactory performance during their tenure, achieving ${gradePoint} grade.${conductNote} We wish them well in their future studies.`;
    return `${name} has completed the academic year at this institution.${conductNote} We wish them well in their future endeavors.`;
  }

  if (percentage >= 90)
    return `${name} has delivered outstanding results with ${gradePoint} grade. Exceptional mastery across all subjects.${conductNote} Keep up the excellent work!`;
  if (percentage >= 80)
    return `${name} has shown excellent performance with ${gradePoint} grade. Strong command over all subjects with consistent effort.${conductNote} Well done!`;
  if (percentage >= 70)
    return `${name} has performed well with ${gradePoint} grade. Good understanding demonstrated across subjects.${conductNote} Continue the solid effort.`;
  if (percentage >= 60)
    return `${name} has achieved satisfactory results with ${gradePoint} grade.${conductNote} Focus on weaker areas to improve further.`;
  return `${name} needs to strengthen their preparation. Regular revision and focused study will lead to better results in the coming term.`;
}

export function generateRemarksForBatch(
  students: Student[],
  docType: string,
  onProgress?: (current: number, total: number, name: string) => void
): Map<string, string> {
  const results = new Map<string, string>();
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    onProgress?.(i + 1, students.length, student.name);
    results.set(student.id, getRemark(student, docType));
  }
  return results;
}

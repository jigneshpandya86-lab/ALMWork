import { Student } from '@/types';

function getRemark(student: Student, docType: string): string {
  const percentage = student.percentage || 0;

  if (docType === 'attendanceRegister') {
    return String(percentage);
  }

  if (docType === 'marksheet') {
    if (percentage >= 90) return `${student.name} has demonstrated outstanding performance with excellent grasp of concepts.`;
    if (percentage >= 75) return `${student.name} has shown good understanding and consistent effort.`;
    if (percentage >= 60) return `${student.name} has satisfactory performance. Focus on weak areas.`;
    return `${student.name} requires additional support and focused practice.`;
  }

  if (docType === 'leavingCert') {
    return `${student.name} is a well-disciplined student with good conduct and character.`;
  }

  if (docType === 'periodicEval') {
    if (percentage >= 80) return `${student.name} shows excellent progress and engagement in studies.`;
    if (percentage >= 60) return `${student.name} is making good progress with consistent effort.`;
    return `${student.name} needs additional support in key areas.`;
  }

  return '';
}

export function generateRemarksForBatch(
  students: Student[],
  docType: string,
  onProgress?: (current: number, total: number, name: string) => void
): Map<string, string> {
  const remarks = new Map<string, string>();

  students.forEach((student, index) => {
    onProgress?.(index + 1, students.length, student.name);
    const remark = getRemark(student, docType);
    remarks.set(student.id, remark);
  });

  return remarks;
}

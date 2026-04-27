import { Student, GeneratedPDF } from '@/types';
import { formatDate, generateFileName, subjectLabel } from './utils';

const SCHOOL = {
  name: 'Vidya Mandir School',
  address: '123, Knowledge Street, Education Nagar, Gujarat — 380001',
  phone: '+91 79 1234 5678',
  email: 'info@vidyamandir.edu.in',
  academicYear: '2025-2026',
  affiliation: 'GSEB',
  evaluationPeriod: 'Term 1',
};

async function getJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
}

type Doc = InstanceType<Awaited<ReturnType<typeof getJsPDF>>>;

// ── Shared helpers ────────────────────────────────────────────────────────────

function drawHeader(doc: Doc): number {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(25, 82, 163);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL.name, pageW / 2, 13, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(SCHOOL.address, pageW / 2, 20, { align: 'center' });
  doc.text(`Phone: ${SCHOOL.phone}  |  Email: ${SCHOOL.email}`, pageW / 2, 26, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  return 38;
}

function sectionTitle(doc: Doc, text: string, y: number, pageW: number): number {
  doc.setFillColor(230, 238, 255);
  doc.rect(10, y, pageW - 20, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(25, 82, 163);
  doc.text(text, 14, y + 5.5);
  doc.setTextColor(0, 0, 0);
  return y + 12;
}

function labelValue(doc: Doc, label: string, value: string, x: number, y: number): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${label}:`, x, y);
  doc.setFont('helvetica', 'normal');
  doc.text(value, x + 40, y);
}

function drawFooter(doc: Doc, pageW: number): void {
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180);
  doc.line(10, pageH - 20, pageW - 10, pageH - 20);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('This is a computer-generated document.', pageW / 2, pageH - 14, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageW / 2, pageH - 9, { align: 'center' });
  doc.setTextColor(0);
}

// ── Marksheet ─────────────────────────────────────────────────────────────────

async function generateMarksheetPDF(student: Student, remarks: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(25, 82, 163);
  doc.text('ANNUAL REPORT CARD', pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
  doc.text(`Academic Year: ${SCHOOL.academicYear}`, pageW / 2, y + 13, { align: 'center' });
  doc.setTextColor(0);
  y += 20;

  y = sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  labelValue(doc, 'Name', student.name, 14, y);
  labelValue(doc, 'Roll No', student.rollno, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Date of Birth', formatDate(student.dateOfBirth), 14, y);
  labelValue(doc, 'Grade', student.grade, pageW / 2 + 5, y); y += 7;
  labelValue(doc, "Father's Name", student.fatherName, 14, y); y += 7;
  labelValue(doc, "Mother's Name", student.motherName, 14, y); y += 7;
  labelValue(doc, 'Address', student.address, 14, y);
  y += 12;

  y = sectionTitle(doc, 'SUBJECT-WISE MARKS', y, pageW);
  const colW = [80, 40, 40, 40];
  const startX = 14; const rowH = 8;

  doc.setFillColor(25, 82, 163);
  doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  let cx = startX + 2;
  ['Subject', 'Marks Obtained', 'Maximum Marks', 'Grade'].forEach((h, i) => { doc.text(h, cx, y + 5.5); cx += colW[i]; });
  doc.setTextColor(0); y += rowH;

  const subjects = Object.entries(student.marks);
  subjects.forEach(([subj, mark], idx) => {
    if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(startX, y, pageW - 28, rowH, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    cx = startX + 2;
    const g = mark >= 90 ? 'A+' : mark >= 80 ? 'A' : mark >= 70 ? 'B+' : mark >= 60 ? 'B' : mark >= 50 ? 'C' : 'D';
    [subjectLabel(subj), String(mark), '100', g].forEach((val, i) => { doc.text(val, cx, y + 5.5); cx += colW[i]; });
    doc.setDrawColor(220); doc.line(startX, y + rowH, startX + (pageW - 28), y + rowH);
    y += rowH;
  });

  doc.setFillColor(25, 82, 163); doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', startX + 2, y + 5.5);
  doc.text(String(student.totalMarks), startX + colW[0] + 2, y + 5.5);
  doc.text(String(subjects.length * 100), startX + colW[0] + colW[1] + 2, y + 5.5);
  doc.text(student.gradePoint, startX + colW[0] + colW[1] + colW[2] + 2, y + 5.5);
  doc.setTextColor(0); y += rowH + 10;

  y = sectionTitle(doc, 'PERFORMANCE SUMMARY', y, pageW);
  labelValue(doc, 'Percentage', `${student.percentage}%`, 14, y);
  labelValue(doc, 'Grade Point', student.gradePoint, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Attendance', `${student.attendance}%`, 14, y);
  labelValue(doc, 'Conduct', student.conduct, pageW / 2 + 5, y);
  y += 12;

  y = sectionTitle(doc, "TEACHER'S REMARKS", y, pageW);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
  const lines = doc.splitTextToSize(remarks, pageW - 30);
  doc.text(lines, 14, y); y += lines.length * 5 + 10;

  if (y < 230) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.line(14, y + 12, 60, y + 12);
    doc.line(pageW / 2 - 23, y + 12, pageW / 2 + 23, y + 12);
    doc.line(pageW - 60, y + 12, pageW - 14, y + 12);
    doc.text('Class Teacher', 14, y + 17);
    doc.text('Principal', pageW / 2 - 10, y + 17);
    doc.text("Parent's Signature", pageW - 58, y + 17);
  }

  drawFooter(doc, pageW);
  return doc;
}

// ── Leaving Certificate ───────────────────────────────────────────────────────

async function generateLeavingCertPDF(student: Student, text: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(25, 82, 163);
  doc.text('SCHOOL LEAVING CERTIFICATE', pageW / 2, y + 8, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
  doc.text(`Affiliation: ${SCHOOL.affiliation}`, pageW / 2, y + 16, { align: 'center' });
  doc.setTextColor(0); y += 26;

  const serial = `LC/${new Date().getFullYear()}/${String(student.rollno).padStart(4, '0')}`;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(`Certificate No: ${serial}`, pageW - 14, y, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW - 14, y + 6, { align: 'right' });
  y += 14;

  y = sectionTitle(doc, 'STUDENT DETAILS', y, pageW);
  const fields: [string, string][] = [
    ["Student's Full Name", student.name],
    ["Father's / Guardian's Name", student.fatherName],
    ["Mother's Name", student.motherName],
    ['Date of Birth', formatDate(student.dateOfBirth)],
    ['Address', student.address],
    ['Admission / Roll No.', student.rollno],
    ['Grade Last Studied', `Grade ${student.grade}`],
    ['Academic Year', SCHOOL.academicYear],
    ['Percentage Obtained', `${student.percentage}% (${student.gradePoint})`],
    ['Attendance', `${student.attendance}%`],
    ['Conduct', student.conduct],
  ];
  fields.forEach(([label, value], idx) => {
    if (idx % 2 === 0) { doc.setFillColor(248, 250, 255); doc.rect(14, y - 1, pageW - 28, 7, 'F'); }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(`${label}:`, 16, y + 4);
    doc.setFont('helvetica', 'normal'); doc.text(value, 80, y + 4);
    y += 7;
  });
  y += 6;

  y = sectionTitle(doc, 'CHARACTER CERTIFICATE', y, pageW);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(text, pageW - 30);
  doc.text(lines, 14, y); y += lines.length * 5.5 + 12;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text('This is to certify that the above information is correct as per school records.', pageW / 2, y, { align: 'center' });
  y += 16;

  doc.line(14, y + 12, 60, y + 12);
  doc.line(pageW - 60, y + 12, pageW - 14, y + 12);
  doc.text('Class Teacher', 14, y + 17);
  doc.text('Principal', pageW - 58, y + 17);

  drawFooter(doc, pageW);
  return doc;
}

// ── Periodic Evaluation ───────────────────────────────────────────────────────

async function generatePeriodicEvalPDF(student: Student, text: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(25, 82, 163);
  doc.text('PERIODIC EVALUATION REPORT', pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
  doc.text(`Period: ${SCHOOL.evaluationPeriod}  |  Academic Year: ${SCHOOL.academicYear}`, pageW / 2, y + 13, { align: 'center' });
  doc.setTextColor(0); y += 22;

  y = sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  labelValue(doc, 'Name', student.name, 14, y);
  labelValue(doc, 'Roll No', student.rollno, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Grade', student.grade, 14, y);
  labelValue(doc, 'Conduct', student.conduct, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Attendance', `${student.attendance}%`, 14, y);
  y += 12;

  y = sectionTitle(doc, 'MARKS SUMMARY', y, pageW);
  const startX = 14; const colW = [90, 35, 35, 35]; const rowH = 7;

  doc.setFillColor(25, 82, 163); doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  let cx = startX + 2;
  ['Subject', 'Marks', 'Max', 'Status'].forEach((h, i) => { doc.text(h, cx, y + 5); cx += colW[i]; });
  doc.setTextColor(0); y += rowH;

  Object.entries(student.marks).forEach(([subj, mark], idx) => {
    if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(startX, y, pageW - 28, rowH, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    cx = startX + 2;
    const status = mark >= 80 ? 'Excellent' : mark >= 60 ? 'Good' : mark >= 40 ? 'Average' : 'Below Avg';
    [subjectLabel(subj), String(mark), '100', status].forEach((val, i) => { doc.text(val, cx, y + 5); cx += colW[i]; });
    doc.setDrawColor(220); doc.line(startX, y + rowH, startX + (pageW - 28), y + rowH);
    y += rowH;
  });

  doc.setFillColor(200, 215, 245); doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Overall', startX + 2, y + 5);
  doc.text(`${student.totalMarks}`, startX + colW[0] + 2, y + 5);
  doc.text(`${Object.keys(student.marks).length * 100}`, startX + colW[0] + colW[1] + 2, y + 5);
  doc.text(`${student.percentage}% (${student.gradePoint})`, startX + colW[0] + colW[1] + colW[2] + 2, y + 5);
  y += rowH + 10;

  y = sectionTitle(doc, 'DETAILED EVALUATION', y, pageW);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(text, pageW - 30);
  doc.text(lines, 14, y); y += lines.length * 5.5 + 12;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.line(14, y + 12, 60, y + 12);
  doc.line(pageW / 2 - 23, y + 12, pageW / 2 + 23, y + 12);
  doc.line(pageW - 60, y + 12, pageW - 14, y + 12);
  doc.text('Subject Teacher', 14, y + 17);
  doc.text('Class Teacher', pageW / 2 - 12, y + 17);
  doc.text('Principal', pageW - 40, y + 17);

  drawFooter(doc, pageW);
  return doc;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function generatePDF(student: Student, remarks: string, docType: string): Promise<Blob> {
  let doc: Doc;
  if (docType === 'marksheet') doc = await generateMarksheetPDF(student, remarks);
  else if (docType === 'leavingCert') doc = await generateLeavingCertPDF(student, remarks);
  else doc = await generatePeriodicEvalPDF(student, remarks);
  return doc.output('blob');
}

export async function generateMultiplePDFs(
  students: Student[],
  documents: Map<string, string>,
  docType: string,
  onProgress?: (current: number, total: number, name: string) => void
): Promise<GeneratedPDF[]> {
  const results: GeneratedPDF[] = [];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    onProgress?.(i + 1, students.length, student.name);
    const blob = await generatePDF(student, documents.get(student.id) ?? '', docType);
    results.push({ studentId: student.id, studentName: student.name, filename: generateFileName(student, docType), blob, size: blob.size });
  }
  return results;
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

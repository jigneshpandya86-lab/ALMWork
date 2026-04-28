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

type SmartTextOptions = {
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  color?: [number, number, number];
};

const GUJARATI_REGEX = /[\u0A80-\u0AFF]/;
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCanvasCtx: CanvasRenderingContext2D | null = null;

function containsGujarati(text: string): boolean {
  return GUJARATI_REGEX.test(text);
}

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCanvasCtx = sharedCanvas.getContext('2d');
  }
  return sharedCanvasCtx;
}

function getFontStyle(options: SmartTextOptions): 'normal' | 'bold' | 'italic' | 'bolditalic' {
  if (options.bold && options.italic) return 'bolditalic';
  if (options.bold) return 'bold';
  if (options.italic) return 'italic';
  return 'normal';
}

function measureSmartTextWidthMm(doc: Doc, text: string, options: SmartTextOptions = {}): number {
  const fontSize = options.fontSize ?? 9;

  if (containsGujarati(text)) {
    const ctx = getCanvasContext();
    if (ctx) {
      const fontWeight = options.bold ? '700' : '400';
      const fontPx = Math.round(fontSize * 4);
      ctx.font = `${fontWeight} ${fontPx}px "Noto Sans Gujarati", sans-serif`;
      const mmPerPx = 0.264583;
      return ctx.measureText(text).width * mmPerPx * 0.85;
    }
  }

  doc.setFont('helvetica', getFontStyle(options));
  doc.setFontSize(fontSize);
  return doc.getTextWidth(text);
}

async function drawCanvasText(doc: Doc, text: string, x: number, y: number, options: SmartTextOptions = {}): Promise<void> {
  const ctx = getCanvasContext();
  if (!ctx || !sharedCanvas) {
    doc.setFontSize(options.fontSize ?? 9);
    doc.setFont('helvetica', getFontStyle(options));
    if (options.color) doc.setTextColor(...options.color);
    doc.text(text, x, y, { align: options.align ?? 'left' });
    return;
  }

  const fontSize = options.fontSize ?? 9;
  const align = options.align ?? 'left';
  const fontWeight = options.bold ? '700' : '400';
  ctx.font = `${fontWeight} ${Math.round(fontSize * 4)}px "Noto Sans Gujarati", sans-serif`;

  const metrics = ctx.measureText(text);
  const width = Math.max(2, Math.ceil(metrics.width + 8));
  const height = Math.max(2, Math.ceil(fontSize * 7));

  sharedCanvas.width = width;
  sharedCanvas.height = height;

  ctx.clearRect(0, 0, width, height);
  ctx.font = `${fontWeight} ${Math.round(fontSize * 4)}px "Noto Sans Gujarati", sans-serif`;
  const color = options.color ?? [17, 17, 17];
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 2, height / 2);

  const mmPerPx = 0.264583;
  const imageWmm = width * mmPerPx * 0.85;
  const imageHmm = height * mmPerPx * 0.85;
  let imageX = x;
  if (align === 'center') imageX = x - imageWmm / 2;
  if (align === 'right') imageX = x - imageWmm;

  doc.addImage(sharedCanvas.toDataURL('image/png'), 'PNG', imageX, y - imageHmm + 1, imageWmm, imageHmm);
}

async function drawSmartText(doc: Doc, text: string, x: number, y: number, options: SmartTextOptions = {}): Promise<void> {
  if (containsGujarati(text)) {
    await drawCanvasText(doc, text, x, y, options);
    return;
  }

  doc.setFontSize(options.fontSize ?? 9);
  doc.setFont('helvetica', getFontStyle(options));
  if (options.color) doc.setTextColor(...options.color);
  doc.text(text, x, y, { align: options.align ?? 'left' });
}

function wrapSmartText(doc: Doc, text: string, maxWidth: number, options: SmartTextOptions = {}): string[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  const pushWrapped = (source: string) => {
    const words = source.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      return;
    }

    let current = '';
    for (const word of words) {
      const testLine = current ? `${current} ${word}` : word;
      if (measureSmartTextWidthMm(doc, testLine, options) <= maxWidth) {
        current = testLine;
        continue;
      }

      if (current) lines.push(current);

      if (measureSmartTextWidthMm(doc, word, options) <= maxWidth) {
        current = word;
        continue;
      }

      let chunk = '';
      for (const ch of Array.from(word)) {
        const testChunk = `${chunk}${ch}`;
        if (measureSmartTextWidthMm(doc, testChunk, options) <= maxWidth) {
          chunk = testChunk;
        } else {
          if (chunk) lines.push(chunk);
          chunk = ch;
        }
      }
      current = chunk;
    }

    if (current) lines.push(current);
  };

  paragraphs.forEach((paragraph, idx) => {
    if (!paragraph.trim()) {
      lines.push('');
    } else {
      pushWrapped(paragraph.trim());
    }
    if (idx < paragraphs.length - 1 && paragraph.trim()) lines.push('');
  });

  return lines;
}

async function drawWrappedSmartText(
  doc: Doc,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: SmartTextOptions = {}
): Promise<{ lines: string[]; endY: number }> {
  const lines = wrapSmartText(doc, text, maxWidth, options);
  const lineHeight = Math.max(4, (options.fontSize ?? 9) * 0.55);
  let currentY = y;

  for (const line of lines) {
    await drawSmartText(doc, line, x, currentY, options);
    currentY += lineHeight;
  }

  return { lines, endY: currentY };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function drawHeader(doc: Doc): Promise<number> {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(25, 82, 163);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setTextColor(255, 255, 255);

  await drawSmartText(doc, SCHOOL.name, pageW / 2, 13, { align: 'center', fontSize: 18, bold: true, color: [255, 255, 255] });
  await drawSmartText(doc, SCHOOL.address, pageW / 2, 20, { align: 'center', fontSize: 9, color: [255, 255, 255] });
  await drawSmartText(doc, `Phone: ${SCHOOL.phone}  |  Email: ${SCHOOL.email}`, pageW / 2, 26, { align: 'center', fontSize: 9, color: [255, 255, 255] });

  doc.setTextColor(0, 0, 0);
  return 38;
}

async function sectionTitle(doc: Doc, text: string, y: number, pageW: number): Promise<number> {
  doc.setFillColor(230, 238, 255);
  doc.rect(10, y, pageW - 20, 8, 'F');
  await drawSmartText(doc, text, 14, y + 5.5, { fontSize: 10, bold: true, color: [25, 82, 163] });
  doc.setTextColor(0, 0, 0);
  return y + 12;
}

async function labelValue(doc: Doc, label: string, value: string, x: number, y: number): Promise<void> {
  await drawSmartText(doc, `${label}:`, x, y, { fontSize: 9, bold: true });
  await drawSmartText(doc, value, x + 40, y, { fontSize: 9 });
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
  let y = await drawHeader(doc);

  await drawSmartText(doc, 'ANNUAL REPORT CARD', pageW / 2, y + 6, { align: 'center', fontSize: 14, bold: true, color: [25, 82, 163] });
  await drawSmartText(doc, `Academic Year: ${SCHOOL.academicYear}`, pageW / 2, y + 13, { align: 'center', fontSize: 9, color: [80, 80, 80] });
  y += 20;

  y = await sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  await labelValue(doc, 'Name', student.name, 14, y);
  await labelValue(doc, 'Roll No', student.rollno, pageW / 2 + 5, y); y += 7;
  await labelValue(doc, 'Date of Birth', formatDate(student.dateOfBirth), 14, y);
  await labelValue(doc, 'Grade', student.grade, pageW / 2 + 5, y); y += 7;
  await labelValue(doc, "Father's Name", student.fatherName, 14, y); y += 7;
  await labelValue(doc, "Mother's Name", student.motherName, 14, y); y += 7;
  await labelValue(doc, 'Address', student.address, 14, y);
  y += 12;

  y = await sectionTitle(doc, 'SUBJECT-WISE MARKS', y, pageW);
  const colW = [80, 40, 40, 40];
  const startX = 14; const rowH = 8;

  doc.setFillColor(25, 82, 163);
  doc.rect(startX, y, pageW - 28, rowH, 'F');
  let cx = startX + 2;
  const marksHeaders = ['Subject', 'Marks Obtained', 'Maximum Marks', 'Grade'];
  for (let i = 0; i < marksHeaders.length; i++) {
    await drawSmartText(doc, marksHeaders[i], cx, y + 5.5, { fontSize: 9, bold: true, color: [255, 255, 255] });
    cx += colW[i];
  }
  y += rowH;

  const subjects = Object.entries(student.marks);
  for (let idx = 0; idx < subjects.length; idx++) {
    const [subj, mark] = subjects[idx];
    if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(startX, y, pageW - 28, rowH, 'F'); }
    cx = startX + 2;
    const g = mark >= 90 ? 'A+' : mark >= 80 ? 'A' : mark >= 70 ? 'B+' : mark >= 60 ? 'B' : mark >= 50 ? 'C' : 'D';
    const rowValues = [subjectLabel(subj), String(mark), '100', g];
    for (let i = 0; i < rowValues.length; i++) {
      await drawSmartText(doc, rowValues[i], cx, y + 5.5, { fontSize: 9 });
      cx += colW[i];
    }
    doc.setDrawColor(220); doc.line(startX, y + rowH, startX + (pageW - 28), y + rowH);
    y += rowH;
  }

  doc.setFillColor(25, 82, 163); doc.rect(startX, y, pageW - 28, rowH, 'F');
  await drawSmartText(doc, 'TOTAL', startX + 2, y + 5.5, { fontSize: 9, bold: true, color: [255, 255, 255] });
  await drawSmartText(doc, String(student.totalMarks), startX + colW[0] + 2, y + 5.5, { fontSize: 9, bold: true, color: [255, 255, 255] });
  await drawSmartText(doc, String(subjects.length * 100), startX + colW[0] + colW[1] + 2, y + 5.5, { fontSize: 9, bold: true, color: [255, 255, 255] });
  await drawSmartText(doc, student.gradePoint, startX + colW[0] + colW[1] + colW[2] + 2, y + 5.5, { fontSize: 9, bold: true, color: [255, 255, 255] });
  y += rowH + 10;

  y = await sectionTitle(doc, 'PERFORMANCE SUMMARY', y, pageW);
  await labelValue(doc, 'Percentage', `${student.percentage}%`, 14, y);
  await labelValue(doc, 'Grade Point', student.gradePoint, pageW / 2 + 5, y); y += 7;
  await labelValue(doc, 'Attendance', `${student.attendance}%`, 14, y);
  await labelValue(doc, 'Conduct', student.conduct, pageW / 2 + 5, y);
  y += 12;

  y = await sectionTitle(doc, "TEACHER'S REMARKS", y, pageW);
  const wrappedRemarks = await drawWrappedSmartText(doc, remarks, 14, y, pageW - 30, { fontSize: 9, italic: true });
  y = wrappedRemarks.endY + 6;

  if (y < 230) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.line(14, y + 12, 60, y + 12);
    doc.line(pageW / 2 - 23, y + 12, pageW / 2 + 23, y + 12);
    doc.line(pageW - 60, y + 12, pageW - 14, y + 12);
    await drawSmartText(doc, 'Class Teacher', 14, y + 17, { fontSize: 9 });
    await drawSmartText(doc, 'Principal', pageW / 2 - 10, y + 17, { fontSize: 9 });
    await drawSmartText(doc, "Parent's Signature", pageW - 58, y + 17, { fontSize: 9 });
  }

  drawFooter(doc, pageW);
  return doc;
}

// ── Leaving Certificate ───────────────────────────────────────────────────────

async function generateLeavingCertPDF(student: Student, text: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = await drawHeader(doc);

  await drawSmartText(doc, 'SCHOOL LEAVING CERTIFICATE', pageW / 2, y + 8, { align: 'center', fontSize: 16, bold: true, color: [25, 82, 163] });
  await drawSmartText(doc, `Affiliation: ${SCHOOL.affiliation}`, pageW / 2, y + 16, { align: 'center', fontSize: 10, color: [80, 80, 80] });
  y += 26;

  const serial = `LC/${new Date().getFullYear()}/${String(student.rollno).padStart(4, '0')}`;
  await drawSmartText(doc, `Certificate No: ${serial}`, pageW - 14, y, { align: 'right', fontSize: 9, bold: true });
  await drawSmartText(doc, `Date: ${new Date().toLocaleDateString('en-IN')}`, pageW - 14, y + 6, { align: 'right', fontSize: 9, bold: true });
  y += 14;

  y = await sectionTitle(doc, 'STUDENT DETAILS', y, pageW);
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
  for (let idx = 0; idx < fields.length; idx++) {
    const [label, value] = fields[idx];
    if (idx % 2 === 0) { doc.setFillColor(248, 250, 255); doc.rect(14, y - 1, pageW - 28, 7, 'F'); }
    await drawSmartText(doc, `${label}:`, 16, y + 4, { fontSize: 9, bold: true });
    await drawSmartText(doc, value, 80, y + 4, { fontSize: 9 });
    y += 7;
  }
  y += 6;

  y = await sectionTitle(doc, 'CHARACTER CERTIFICATE', y, pageW);
  const wrapped = await drawWrappedSmartText(doc, text, 14, y, pageW - 30, { fontSize: 9.5, italic: true });
  y = wrapped.endY + 6;

  await drawSmartText(doc, 'This is to certify that the above information is correct as per school records.', pageW / 2, y, { align: 'center', fontSize: 9 });
  y += 16;

  doc.line(14, y + 12, 60, y + 12);
  doc.line(pageW - 60, y + 12, pageW - 14, y + 12);
  await drawSmartText(doc, 'Class Teacher', 14, y + 17, { fontSize: 9 });
  await drawSmartText(doc, 'Principal', pageW - 58, y + 17, { fontSize: 9 });

  drawFooter(doc, pageW);
  return doc;
}

// ── Periodic Evaluation ───────────────────────────────────────────────────────

async function generatePeriodicEvalPDF(student: Student, text: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = await drawHeader(doc);

  await drawSmartText(doc, 'PERIODIC EVALUATION REPORT', pageW / 2, y + 6, { align: 'center', fontSize: 14, bold: true, color: [25, 82, 163] });
  await drawSmartText(doc, `Period: ${SCHOOL.evaluationPeriod}  |  Academic Year: ${SCHOOL.academicYear}`, pageW / 2, y + 13, { align: 'center', fontSize: 9, color: [80, 80, 80] });
  y += 22;

  y = await sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  await labelValue(doc, 'Name', student.name, 14, y);
  await labelValue(doc, 'Roll No', student.rollno, pageW / 2 + 5, y); y += 7;
  await labelValue(doc, 'Grade', student.grade, 14, y);
  await labelValue(doc, 'Conduct', student.conduct, pageW / 2 + 5, y); y += 7;
  await labelValue(doc, 'Attendance', `${student.attendance}%`, 14, y);
  y += 12;

  y = await sectionTitle(doc, 'MARKS SUMMARY', y, pageW);
  const startX = 14; const colW = [90, 35, 35, 35]; const rowH = 7;

  doc.setFillColor(25, 82, 163); doc.rect(startX, y, pageW - 28, rowH, 'F');
  let cx = startX + 2;
  const periodicHeaders = ['Subject', 'Marks', 'Max', 'Status'];
  for (let i = 0; i < periodicHeaders.length; i++) {
    await drawSmartText(doc, periodicHeaders[i], cx, y + 5, { fontSize: 9, bold: true, color: [255, 255, 255] });
    cx += colW[i];
  }
  y += rowH;

  const periodicEntries = Object.entries(student.marks);
  for (let idx = 0; idx < periodicEntries.length; idx++) {
    const [subj, mark] = periodicEntries[idx];
    if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(startX, y, pageW - 28, rowH, 'F'); }
    cx = startX + 2;
    const status = mark >= 80 ? 'Excellent' : mark >= 60 ? 'Good' : mark >= 40 ? 'Average' : 'Below Avg';
    const rowValues = [subjectLabel(subj), String(mark), '100', status];
    for (let i = 0; i < rowValues.length; i++) {
      await drawSmartText(doc, rowValues[i], cx, y + 5, { fontSize: 9 });
      cx += colW[i];
    }
    doc.setDrawColor(220); doc.line(startX, y + rowH, startX + (pageW - 28), y + rowH);
    y += rowH;
  }

  doc.setFillColor(200, 215, 245); doc.rect(startX, y, pageW - 28, rowH, 'F');
  await drawSmartText(doc, 'Overall', startX + 2, y + 5, { fontSize: 9, bold: true });
  await drawSmartText(doc, `${student.totalMarks}`, startX + colW[0] + 2, y + 5, { fontSize: 9, bold: true });
  await drawSmartText(doc, `${Object.keys(student.marks).length * 100}`, startX + colW[0] + colW[1] + 2, y + 5, { fontSize: 9, bold: true });
  await drawSmartText(doc, `${student.percentage}% (${student.gradePoint})`, startX + colW[0] + colW[1] + colW[2] + 2, y + 5, { fontSize: 9, bold: true });
  y += rowH + 10;

  y = await sectionTitle(doc, 'DETAILED EVALUATION', y, pageW);
  const wrapped = await drawWrappedSmartText(doc, text, 14, y, pageW - 30, { fontSize: 9.5, italic: true });
  y = wrapped.endY + 6;

  doc.line(14, y + 12, 60, y + 12);
  doc.line(pageW / 2 - 23, y + 12, pageW / 2 + 23, y + 12);
  doc.line(pageW - 60, y + 12, pageW - 14, y + 12);
  await drawSmartText(doc, 'Subject Teacher', 14, y + 17, { fontSize: 9 });
  await drawSmartText(doc, 'Class Teacher', pageW / 2 - 12, y + 17, { fontSize: 9 });
  await drawSmartText(doc, 'Principal', pageW - 40, y + 17, { fontSize: 9 });

  drawFooter(doc, pageW);
  return doc;
}

// ── Attendance Register ────────────────────────────────────────────────────────

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const MONTHS_GJ = ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
  'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'];

async function generateAttendanceRegisterPDF(
  students: Student[],
  attendanceData: Map<string, { month: number; year: number; days: boolean[] }>,
  grade: string
): Promise<Blob> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  if (students.length === 0) throw new Error('No students provided');
  const firstStudent = students[0];
  const monthYearData = attendanceData.get(firstStudent.id);
  if (!monthYearData) throw new Error('No attendance data provided');

  const daysInMonth = monthYearData.days.length;
  const startX = 10;
  const srNoColW = 14;
  const nameColW = 52;
  const dayColW = (pageW - (startX * 2) - srNoColW - nameColW) / daysInMonth;
  const rowH = 6.6;

  const drawPageHeader = async () => {
    let y = 12;
    doc.setTextColor(20, 20, 20);
    await drawSmartText(doc, `જિલ્લા શિક્ષણ સમિતિ સંચાલિત શાળા  ${SCHOOL.academicYear}`, pageW / 2, y, { align: 'center', fontSize: 10, bold: true });
    y += 7;
    await drawSmartText(doc, `માસિક હાજરી પત્રક  •  ધોરણ: ${grade}`, pageW / 2, y, { align: 'center', fontSize: 11, bold: true });
    y += 6;
    await drawSmartText(doc, `${MONTHS_GJ[monthYearData.month]} - ${monthYearData.year}`, pageW / 2, y, { align: 'center', fontSize: 9, bold: true });
    y += 6;

    await drawSmartText(doc, `${MONTHS_EN[monthYearData.month]} ${monthYearData.year}`, pageW / 2, y, { align: 'center', fontSize: 8 });
    y += 4;

    doc.setDrawColor(90, 90, 90);
    doc.setFillColor(236, 236, 236);
    doc.setTextColor(0, 0, 0);

    doc.rect(startX, y, srNoColW, rowH * 2, 'FD');
    doc.rect(startX + srNoColW, y, nameColW, rowH * 2, 'FD');
    await drawSmartText(doc, 'ક્રમ', startX + srNoColW / 2, y + (rowH * 1.2), { align: 'center', fontSize: 7.2, bold: true });
    await drawSmartText(doc, 'વિદ્યાર્થીનું નામ', startX + srNoColW + nameColW / 2, y + (rowH * 1.2), { align: 'center', fontSize: 7.2, bold: true });

    for (let day = 1; day <= daysInMonth; day++) {
      const dayX = startX + srNoColW + nameColW + (day - 1) * dayColW;
      const date = new Date(monthYearData.year, monthYearData.month, day);
      const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
      doc.rect(dayX, y, dayColW, rowH, 'FD');
      doc.rect(dayX, y + rowH, dayColW, rowH, 'FD');
      await drawSmartText(doc, dayAbbr, dayX + dayColW / 2, y + 4.2, { align: 'center', fontSize: 7 });
      await drawSmartText(doc, String(day), dayX + dayColW / 2, y + rowH + 4.2, { align: 'center', fontSize: 7 });
    }

    return y + (rowH * 2);
  };

  const isSunday = (day: number) => new Date(monthYearData.year, monthYearData.month, day).getDay() === 0;

  let y = await drawPageHeader();

  for (let idx = 0; idx < students.length; idx++) {
    const student = students[idx];
    if (y + rowH > pageH - 12) {
      doc.addPage();
      y = await drawPageHeader();
    }

    doc.setDrawColor(130, 130, 130);
    doc.setTextColor(0, 0, 0);

    doc.rect(startX, y, srNoColW, rowH);
    await drawSmartText(doc, String(idx + 1), startX + srNoColW / 2, y + 4.2, { align: 'center', fontSize: 6.8 });

    doc.rect(startX + srNoColW, y, nameColW, rowH);
    await drawSmartText(doc, student.name, startX + srNoColW + 1.3, y + 4.2, { fontSize: 7 });

    for (let day = 1; day <= daysInMonth; day++) {
      const dayX = startX + srNoColW + nameColW + (day - 1) * dayColW;
      const sunday = isSunday(day);

      if (sunday) {
        doc.setFillColor(230, 230, 230);
        doc.rect(dayX, y, dayColW, rowH, 'F');
      }

      doc.rect(dayX, y, dayColW, rowH);
      if (sunday) {
        await drawSmartText(doc, 'S', dayX + dayColW / 2, y + 4.2, { align: 'center', fontSize: 6.8, bold: true });
      }
    }

    y += rowH;
  }

  drawFooter(doc, pageW);
  return doc.output('blob');
}

// ── Public API ─────────────────────────────────────────────────────────────────

async function generateSingleStudentAttendancePDF(student: Student, attendance: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = await drawHeader(doc);

  await drawSmartText(doc, 'ATTENDANCE REGISTER', pageW / 2, y + 6, { align: 'center', fontSize: 14, bold: true, color: [16, 185, 129] });
  y += 16;

  y = await sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  await labelValue(doc, 'Name', student.name, 14, y);
  await labelValue(doc, 'Grade', student.grade, pageW / 2 + 5, y); y += 7;
  await labelValue(doc, 'Roll No', student.rollno, 14, y);
  await labelValue(doc, 'Attendance %', `${attendance}%`, pageW / 2 + 5, y);
  y += 12;

  y = await sectionTitle(doc, 'MONTH CALENDAR', y, pageW);
  await drawSmartText(doc, '(Mark L for Leave, P for Present, A for Absent)', 14, y, { fontSize: 8 });
  y += 4;

  const daysInMonth = 30;
  const cols = 6;
  const cellW = (pageW - 28) / cols;
  const cellH = 5;
  const startX = 14;

  for (let day = 1; day <= daysInMonth; day++) {
    const col = (day - 1) % cols;
    const row = Math.floor((day - 1) / cols);
    const x = startX + col * cellW;
    const cellY = y + row * cellH;

    doc.setDrawColor(200);
    doc.rect(x, cellY, cellW, cellH);
    await drawSmartText(doc, String(day), x + 1, cellY + 3.5, { fontSize: 7, bold: true });
  }

  drawFooter(doc, pageW);
  return doc;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function generatePDF(student: Student, remarks: string, docType: string): Promise<Blob> {
  let doc: Doc;
  if (docType === 'marksheet') doc = await generateMarksheetPDF(student, remarks);
  else if (docType === 'leavingCert') doc = await generateLeavingCertPDF(student, remarks);
  else if (docType === 'attendanceRegister') doc = await generateSingleStudentAttendancePDF(student, remarks);
  else doc = await generatePeriodicEvalPDF(student, remarks);
  return doc.output('blob');
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
  } else {
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      onProgress?.(i + 1, students.length, student.name);

      if (!template) {
        throw new Error('Template required for non-attendance documents');
      }

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

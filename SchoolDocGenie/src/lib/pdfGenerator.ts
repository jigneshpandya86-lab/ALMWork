import { Student, GeneratedPDF } from '@/types';
import { formatDate, generateFileName, subjectLabel } from './utils';
import { t } from './gujaratiMapping';

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

async function configureGujaratiFont(doc: Doc) {
  // We'll use a standard font that supports Unicode if possible, 
  // but for jsPDF we usually need to add the font.
  // Since we have @fontsource/noto-sans-gujarati installed, 
  // in a real browser environment we'd load the .ttf.
  // For now, we'll assume the environment has it or we use a fallback strategy.
  // jsPDF supports adding fonts via base64.
  
  try {
    // Attempt to load Noto Sans Gujarati from a known CDN for base64 if not bundled
    // Or just use the built-in identity mapping if the font is available in the system
    doc.addFont('https://fonts.gstatic.com/s/notosansgujarati/v25/0yb9IEw8eXWp4W6H9vC4CzS3r-E_U2C3.ttf', 'NotoSansGujarati', 'normal');
    doc.setFont('NotoSansGujarati');
  } catch (e) {
    console.warn('Could not load Gujarati font, falling back to Helvetica');
    doc.setFont('helvetica');
  }
}

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
  doc.text(t(text), 14, y + 5.5);
  doc.setTextColor(0, 0, 0);
  return y + 12;
}

function labelValue(doc: Doc, label: string, value: string, x: number, y: number): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`${t(label)}:`, x, y);
  doc.setFont('helvetica', 'normal');
  doc.text(value, x + 40, y);
}

function drawFooter(doc: Doc, pageW: number): void {
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180);
  doc.line(10, pageH - 20, pageW - 10, pageH - 20);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(t('This is a computer-generated document.'), pageW / 2, pageH - 14, { align: 'center' });
  doc.text(`${t('Generated on')}: ${new Date().toLocaleDateString('en-IN')}`, pageW / 2, pageH - 9, { align: 'center' });
  doc.setTextColor(0);
}

// ── Marksheet ─────────────────────────────────────────────────────────────────

async function generateMarksheetPDF(student: Student, remarks: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  await configureGujaratiFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(25, 82, 163);
  doc.text(t('Marksheet').toUpperCase(), pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
  doc.text(`${t('Academic Year')}: ${SCHOOL.academicYear}`, pageW / 2, y + 13, { align: 'center' });
  doc.setTextColor(0);
  y += 20;

  y = sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  labelValue(doc, 'Name', student.nameGujarati || student.name, 14, y);
  labelValue(doc, 'Roll No', student.rollno, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Date of Birth', formatDate(student.dateOfBirth), 14, y);
  labelValue(doc, 'Grade', student.grade, pageW / 2 + 5, y); y += 7;
  labelValue(doc, "Father's Name", student.fatherNameGujarati || student.fatherName, 14, y); y += 7;
  labelValue(doc, "Mother's Name", student.motherNameGujarati || student.motherName, 14, y); y += 7;
  labelValue(doc, 'Address', student.addressGujarati || student.address, 14, y);
  y += 12;

  y = sectionTitle(doc, 'SUBJECT-WISE MARKS', y, pageW);
  const colW = [80, 40, 40, 40];
  const startX = 14; const rowH = 8;

  doc.setFillColor(25, 82, 163);
  doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  let cx = startX + 2;
  [t('Subject'), t('Marks Obtained'), t('Maximum Marks'), t('Grade Point')].forEach((h, i) => { doc.text(h, cx, y + 5.5); cx += colW[i]; });
  doc.setTextColor(0); y += rowH;

  const subjects = Object.entries(student.marks);
  subjects.forEach(([subj, mark], idx) => {
    if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(startX, y, pageW - 28, rowH, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    cx = startX + 2;
    const g = mark >= 90 ? 'A+' : mark >= 80 ? 'A' : mark >= 70 ? 'B+' : mark >= 60 ? 'B' : mark >= 50 ? 'C' : 'D';
    [t(subjectLabel(subj)), String(mark), '100', g].forEach((val, i) => { doc.text(val, cx, y + 5.5); cx += colW[i]; });
    doc.setDrawColor(220); doc.line(startX, y + rowH, startX + (pageW - 28), y + rowH);
    y += rowH;
  });

  doc.setFillColor(25, 82, 163); doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text(t('Total'), startX + 2, y + 5.5);
  doc.text(String(student.totalMarks), startX + colW[0] + 2, y + 5.5);
  doc.text(String(subjects.length * 100), startX + colW[0] + colW[1] + 2, y + 5.5);
  doc.text(student.gradePoint, startX + colW[0] + colW[1] + colW[2] + 2, y + 5.5);
  doc.setTextColor(0); y += rowH + 10;

  y = sectionTitle(doc, 'PERFORMANCE SUMMARY', y, pageW);
  labelValue(doc, 'Percentage', `${student.percentage}%`, 14, y);
  labelValue(doc, 'Grade Point', student.gradePoint, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Attendance', `${student.attendance}%`, 14, y);
  labelValue(doc, 'Conduct', t(student.conduct), pageW / 2 + 5, y);
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
    doc.text(t('Class Teacher'), 14, y + 17);
    doc.text(t('Principal'), pageW / 2 - 10, y + 17);
    doc.text(t("Parent's Signature"), pageW - 58, y + 17);
  }

  drawFooter(doc, pageW);
  return doc;
}

// ── Leaving Certificate ───────────────────────────────────────────────────────

async function generateLeavingCertPDF(student: Student, text: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  await configureGujaratiFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(25, 82, 163);
  doc.text(t('Leaving Certificate').toUpperCase(), pageW / 2, y + 8, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
  doc.text(`${t('Academic Year')}: ${SCHOOL.academicYear}`, pageW / 2, y + 16, { align: 'center' });
  doc.setTextColor(0); y += 26;

  const serial = `LC/${new Date().getFullYear()}/${String(student.rollno).padStart(4, '0')}`;
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text(`${t('Certificate No')}: ${serial}`, pageW - 14, y, { align: 'right' });
  doc.text(`${t('Date')}: ${new Date().toLocaleDateString('en-IN')}`, pageW - 14, y + 6, { align: 'right' });
  y += 14;

  y = sectionTitle(doc, 'STUDENT DETAILS', y, pageW);
  const fields: [string, string][] = [
    [t("Name"), student.nameGujarati || student.name],
    [t("Father's Name"), student.fatherNameGujarati || student.fatherName],
    [t("Mother's Name"), student.motherNameGujarati || student.motherName],
    [t('Date of Birth'), formatDate(student.dateOfBirth)],
    [t('Address'), student.addressGujarati || student.address],
    [t('Roll No'), student.rollno],
    [t('Grade'), student.grade],
    [t('Academic Year'), SCHOOL.academicYear],
    [t('Percentage'), `${student.percentage}% (${student.gradePoint})`],
    [t('Attendance'), `${student.attendance}%`],
    [t('Conduct'), t(student.conduct)],
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
  doc.text(t('Class Teacher'), 14, y + 17);
  doc.text(t('Principal'), pageW - 58, y + 17);

  drawFooter(doc, pageW);
  return doc;
}

// ── Periodic Evaluation ───────────────────────────────────────────────────────

async function generatePeriodicEvalPDF(student: Student, text: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  await configureGujaratiFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(25, 82, 163);
  doc.text(t('Periodic Evaluation Report').toUpperCase(), pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
  doc.text(`Period: ${SCHOOL.evaluationPeriod}  |  ${t('Academic Year')}: ${SCHOOL.academicYear}`, pageW / 2, y + 13, { align: 'center' });
  doc.setTextColor(0); y += 22;

  y = sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  labelValue(doc, 'Name', student.nameGujarati || student.name, 14, y);
  labelValue(doc, 'Roll No', student.rollno, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Grade', student.grade, 14, y);
  labelValue(doc, 'Conduct', t(student.conduct), pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Attendance', `${student.attendance}%`, 14, y);
  y += 12;

  y = sectionTitle(doc, 'MARKS SUMMARY', y, pageW);
  const startX = 14; const colW = [90, 35, 35, 35]; const rowH = 7;

  doc.setFillColor(25, 82, 163); doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  let cx = startX + 2;
  [t('Subject'), t('Marks'), t('Total'), t('Status')].forEach((h, i) => { doc.text(h, cx, y + 5); cx += colW[i]; });
  doc.setTextColor(0); y += rowH;

  Object.entries(student.marks).forEach(([subj, mark], idx) => {
    if (idx % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(startX, y, pageW - 28, rowH, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    cx = startX + 2;
    const status = mark >= 80 ? 'Excellent' : mark >= 60 ? 'Good' : mark >= 40 ? 'Average' : 'Below Avg';
    [t(subjectLabel(subj)), String(mark), '100', t(status)].forEach((val, i) => { doc.text(val, cx, y + 5); cx += colW[i]; });
    doc.setDrawColor(220); doc.line(startX, y + rowH, startX + (pageW - 28), y + rowH);
    y += rowH;
  });

  doc.setFillColor(200, 215, 245); doc.rect(startX, y, pageW - 28, rowH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text(t('Overall'), startX + 2, y + 5);
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
  doc.text(t('Subject Teacher'), 14, y + 17);
  doc.text(t('Class Teacher'), pageW / 2 - 12, y + 17);
  doc.text(t('Principal'), pageW - 40, y + 17);

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
  const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  await configureGujaratiFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  if (students.length === 0) throw new Error('No students provided');
  const firstStudent = students[0];
  const monthYearData = attendanceData.get(firstStudent.id);
  if (!monthYearData) throw new Error('No attendance data provided');

  const daysInMonth = monthYearData.days.length;
  const startX = 8;
  const srNoColW = 10;
  const nameColW = 48;
  const dayColW = (pageW - (startX * 2) - srNoColW - nameColW) / daysInMonth;
  const rowH = 6;

  const drawPageHeader = () => {
    let y = 12;
    doc.setTextColor(25, 82, 163);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(t('Attendance Register').toUpperCase(), pageW / 2, y, { align: 'center' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`${MONTHS_GJ[monthYearData.month]} ${monthYearData.year}  |  ${t('Standard')}: ${grade}`, pageW / 2, y, { align: 'center' });
    y += 4;

    doc.setFontSize(8);
    doc.text(`(${MONTHS_EN[monthYearData.month]} ${monthYearData.year}) - Standard ${grade}`, pageW / 2, y, { align: 'center' });
    y += 6;

    doc.setDrawColor(90, 90, 90);
    doc.setFillColor(236, 236, 236);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);

    doc.rect(startX, y, srNoColW, rowH, 'FD');
    doc.text('No', startX + srNoColW / 2, y + 4.1, { align: 'center' });

    doc.rect(startX + srNoColW, y, nameColW, rowH, 'FD');
    doc.text(t('Name'), startX + srNoColW + 1.5, y + 4.1);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayX = startX + srNoColW + nameColW + (day - 1) * dayColW;
      doc.rect(dayX, y, dayColW, rowH, 'FD');
      doc.text(String(day), dayX + dayColW / 2, y + 4.1, { align: 'center' });
    }

    return y + rowH;
  };

  const isSunday = (day: number) => new Date(monthYearData.year, monthYearData.month, day).getDay() === 0;

  let y = drawPageHeader();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  students.forEach((student, idx) => {
    if (y + rowH > pageH - 12) {
      doc.addPage();
      y = drawPageHeader();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
    }

    doc.setDrawColor(130, 130, 130);
    doc.setTextColor(0, 0, 0);

    doc.rect(startX, y, srNoColW, rowH);
    doc.text(String(idx + 1), startX + srNoColW / 2, y + 4, { align: 'center' });

    doc.rect(startX + srNoColW, y, nameColW, rowH);
    doc.text(student.nameGujarati || student.name, startX + srNoColW + 1.5, y + 4);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayX = startX + srNoColW + nameColW + (day - 1) * dayColW;
      const sunday = isSunday(day);

      if (sunday) {
        doc.setFillColor(230, 230, 230);
        doc.rect(dayX, y, dayColW, rowH, 'F');
      }

      doc.rect(dayX, y, dayColW, rowH);
      if (sunday) {
        doc.setFont('helvetica', 'bold');
        doc.text('S', dayX + dayColW / 2, y + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
      }
    }

    y += rowH;
  });

  drawFooter(doc, pageW);
  return doc.output('blob');
}

// ── Public API ─────────────────────────────────────────────────────────────────

async function generateSingleStudentAttendancePDF(student: Student, attendance: string): Promise<Doc> {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  await configureGujaratiFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  let y = drawHeader(doc);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(16, 185, 129);
  doc.text(t('Attendance Register').toUpperCase(), pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
  y += 16;

  y = sectionTitle(doc, 'STUDENT INFORMATION', y, pageW);
  labelValue(doc, 'Name', student.nameGujarati || student.name, 14, y);
  labelValue(doc, 'Grade', student.grade, pageW / 2 + 5, y); y += 7;
  labelValue(doc, 'Roll No', student.rollno, 14, y);
  labelValue(doc, 'Attendance', `${attendance}%`, pageW / 2 + 5, y);
  y += 12;

  y = sectionTitle(doc, 'MONTH CALENDAR', y, pageW);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text('(Mark L for Leave, P for Present, A for Absent)', 14, y);
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(String(day), x + 1, cellY + 3.5);
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

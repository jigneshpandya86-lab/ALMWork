import {
  CsvCellValue,
  CsvRow,
  ReportBlueprint,
  TableBlockConfig,
  TableColumnDef,
  Student,
} from '@/types';
import { calculatePercentage, getGradePoint } from './utils';
import * as XLSX from 'xlsx';

type RowValue = CsvCellValue;
type ParsedRow = CsvRow;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function toStringValue(value: RowValue): string {
  return String(value ?? '').trim();
}

function readRowValue(row: ParsedRow, ...keys: string[]): string {
  const normalizedKeys = keys.map(normalizeKey);
  const entry = Object.entries(row).find(([key]) => normalizedKeys.includes(normalizeKey(key)));
  return toStringValue(entry?.[1]);
}

function parseNumber(value: RowValue): number {
  const parsed = Number.parseInt(toStringValue(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapRowToStudent(row: ParsedRow, idx: number): Student {
  const marks = parseMarks(row);
  const totalMarks = Object.values(marks).reduce((a, b) => a + b, 0);
  const percentage = calculatePercentage(marks);

  return {
    id: `${Date.now()}-${idx}`,
    name: readRowValue(row, 'name'),
    rollno: readRowValue(row, 'rollno', 'roll no'),
    grade: readRowValue(row, 'grade'),
    gender: readRowValue(row, 'gender'),
    caste: readRowValue(row, 'caste'),
    dateOfBirth: readRowValue(row, 'dateOfBirth', 'date of birth'),
    fatherName: readRowValue(row, 'fatherName', 'father name'),
    motherName: readRowValue(row, 'motherName', 'mother name'),
    address: readRowValue(row, 'address'),
    marks,
    totalMarks,
    percentage,
    gradePoint: getGradePoint(percentage),
    conduct: readRowValue(row, 'conduct') || 'Good',
    attendance: parseNumber(readRowValue(row, 'attendance')),
  };
}

export async function parseCSV(file: File): Promise<Student[]> {
  try {
    const csvText = await file.text();
    const rows = parseCSVText(csvText);
    const students = rows.map(mapRowToStudent);

    return students;
  } catch (error) {
    throw new Error(`Unable to parse CSV file: ${(error as Error).message}`);
  }
}

export async function parseExcel(file: File): Promise<Student[]> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return [];
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: '' });
    return rows.map(mapRowToStudent);
  } catch (error) {
    throw new Error(`Unable to parse Excel file: ${(error as Error).message}`);
  }
}

export function extractDynamicColumns(csvData: ParsedRow[]): TableColumnDef[] {
  const firstRow = csvData[0];
  if (!firstRow) {
    return [];
  }

  return Object.keys(firstRow).map((key) => ({
    label: key,
    csvColumn: key,
  }));
}

export async function parseCSVAndMap(file: File, reportBlueprint: ReportBlueprint): Promise<{
  csvData: ParsedRow[];
  mappedBlueprint: ReportBlueprint;
}> {
  const csvText = await file.text();
  const csvData = parseCSVText(csvText);

  const mappedBlueprint: ReportBlueprint = {
    ...reportBlueprint,
    designBlocks: reportBlueprint.designBlocks.map((block) => {
      if (block.type !== 'table') {
        return block;
      }

      if (block.columns && block.columns.length > 0) {
        return block;
      }

      const resolvedColumns = extractDynamicColumns(csvData);
      return {
        ...(block as TableBlockConfig),
        columns: resolvedColumns,
      };
    }),
  };

  return { csvData, mappedBlueprint };
}

function parseMarks(row: ParsedRow): { [subject: string]: number } {
  const marks: { [key: string]: number } = {};
  const subjects = ['hindi', 'english', 'mathematics', 'science', 'socialStudies'];

  subjects.forEach((subj) => {
    marks[subj] = parseNumber(readRowValue(row, subj));
  });

  return marks;
}

function splitCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCSVText(csvText: string): ParsedRow[] {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCSVLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = splitCSVLine(line);
    return headers.reduce<ParsedRow>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
}

export function generateSampleCSV(): string {
  const headers = ['name', 'rollno', 'grade', 'gender', 'caste', 'dateOfBirth', 'fatherName', 'motherName', 'address', 'hindi', 'english', 'mathematics', 'science', 'socialStudies', 'conduct', 'attendance'];
  const sampleData = [
    ['Aarjun Patel', '101', '6', 'Male', 'OBC', '2012-05-15', 'Rajesh Patel', 'Priya Patel', '123 Main St', '85', '90', '88', '92', '87', 'Excellent', '95'],
    ['Bhavna Shah', '102', '6', 'Female', 'General', '2012-08-22', 'Vikram Shah', 'Neha Shah', '456 Oak Ave', '78', '82', '80', '85', '79', 'Good', '92'],
    ['Chirag Desai', '103', '7', 'Male', 'SC', '2011-03-10', 'Amit Desai', 'Sneha Desai', '789 Pine Rd', '92', '95', '94', '97', '93', 'Excellent', '98'],
    ['Diya Gupta', '104', '7', 'Female', 'General', '2011-11-05', 'Arjun Gupta', 'Pooja Gupta', '321 Elm St', '88', '91', '89', '93', '90', 'Excellent', '96'],
    ['Eshan Mehta', '105', '8', 'Male', 'ST', '2010-07-20', 'Suresh Mehta', 'Anjali Mehta', '654 Birch Ln', '75', '78', '76', '80', '77', 'Good', '88'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
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

export interface Student {
  id: string;
  name: string;
  nameGujarati?: string;
  rollno: string;
  grade: string;
  gender: string;
  caste: string;
  dateOfBirth: string;
  fatherName: string;
  fatherNameGujarati?: string;
  motherName: string;
  motherNameGujarati?: string;
  address: string;
  addressGujarati?: string;
  marks: { [subject: string]: number };
  totalMarks: number;
  percentage: number;
  gradePoint: string;
  conduct: string;
  attendance: number;
  remarks?: string;
  assessmentMarks?: Record<string, '✓' | '×'>;
}

export interface DocumentTemplate {
  docType: string;
  title: string;
  grades: string[];
  aiPrompts: { [grade: string]: string };
  fields: string[];
  remarksRules?: { [range: string]: string };
  schoolInfo?: SchoolInfo;
  evaluationPeriod?: string;
}

export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  academicYear: string;
  affiliation?: string;
  maxMarksPerSubject?: number;
  totalSubjects?: number;
  maxTotalMarks?: number;
}

export type DocType =
  | 'marksheet'
  | 'leavingCert'
  | 'periodicEval'
  | 'attendanceRegister'
  | 'std6PaMathsAttendance'
  | 'std6PaSciAttendance'
  | 'std7PaMathsAttendance'
  | 'std7PaSciAttendance'
  | 'std8PaMathsAttendance'
  | 'std8PaSciAttendance';

export interface GeneratedPDF {
  studentId: string;
  studentName: string;
  filename: string;
  blob: Blob;
  size: number;
}

export interface GenerationProgress {
  current: number;
  total: number;
  currentStudentName: string;
  status: 'idle' | 'generating' | 'complete' | 'error';
  error?: string;
}

export interface ValidationResult {
  valid: Student[];
  errors: string[];
}

export interface FileUploaderProps {
  onStudentsLoaded: (students: Student[]) => void;
  onError: (error: string) => void;
}

export interface StudentTableProps {
  students: Student[];
  selectedGrade?: string;
  onSaveStudent: (student: Student, mode: 'add' | 'edit') => void;
  onDeleteStudent: (studentId: string) => void;
  onBulkDeleteStudents: (studentIds: string[]) => void;
}

export interface TemplateSelectorProps {
  onSelect: (docType: DocType, grade: string) => void;
  selectedDocType: DocType | null;
  selectedGrade: string | null;
}

export interface GenerateButtonProps {
  students: Student[];
  docType: DocType | null;
  grade: string | null;
  onGenerateStart: () => void;
  onProgress: (current: number, total: number, name: string) => void;
  onGenerateComplete: (pdfs: GeneratedPDF[]) => void;
  onError: (error: string) => void;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  currentStudentName: string;
  status: GenerationProgress['status'];
}

export interface DownloadLinksProps {
  pdfs: GeneratedPDF[];
}

export type CsvCellValue = string | number | null | undefined;
export type CsvRow = Record<string, CsvCellValue>;

export interface DocumentHeaderConfig {
  line1: string;
  line2?: string;
  line3?: string;
  line4?: string;
}

export type BlockType = 'header' | 'studentMeta' | 'table' | 'signatures' | 'narrativeText';

export interface BaseBlockConfig {
  id: string;
  type: BlockType;
  className?: string;
}

export interface TableColumnDef {
  label: string;
  csvColumn: string;
}

export interface StudentMetaFieldDef {
  label: string;
  csvKey: string;
}

export interface HeaderBlockConfig extends BaseBlockConfig {
  type: 'header';
  header: DocumentHeaderConfig;
}

export interface StudentMetaBlockConfig extends BaseBlockConfig {
  type: 'studentMeta';
  fields: StudentMetaFieldDef[];
  title?: string;
  dataMode?: 'firstRow' | 'allRows';
}

export interface TableBlockConfig extends BaseBlockConfig {
  type: 'table';
  title?: string;
  columns?: TableColumnDef[];
  rowSource?: 'allRows' | 'firstRow';
}

export interface SignatureBlockConfig extends BaseBlockConfig {
  type: 'signatures';
  labels: string[];
}

export interface NarrativeTextBlockConfig extends BaseBlockConfig {
  type: 'narrativeText';
  text: string;
}

export type DesignBlockConfig =
  | HeaderBlockConfig
  | StudentMetaBlockConfig
  | TableBlockConfig
  | SignatureBlockConfig
  | NarrativeTextBlockConfig;

export interface ReportBlueprint {
  id: string;
  name: string;
  layout: 'portrait' | 'landscape';
  designBlocks: DesignBlockConfig[];
}

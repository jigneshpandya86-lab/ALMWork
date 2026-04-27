export interface Student {
  id: string;
  name: string;
  rollno: string;
  grade: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  address: string;
  marks: { [subject: string]: number };
  totalMarks: number;
  percentage: number;
  gradePoint: string;
  conduct: string;
  attendance: number;
  remarks?: string;
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

export type DocType = 'marksheet' | 'leavingCert' | 'periodicEval';

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

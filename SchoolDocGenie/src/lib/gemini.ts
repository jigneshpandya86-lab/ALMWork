import { Student, DocumentTemplate } from '@/types';
import { buildPrompt, getRemarks } from './utils';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGeminiAPI(
  student: Student,
  template: DocumentTemplate,
  grade: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return getFallbackRemarks(student, template);
  }

  const prompt = buildPrompt(template, student, grade);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message ?? response.statusText;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || getFallbackRemarks(student, template);
}

function getFallbackRemarks(student: Student, template: DocumentTemplate): string {
  return getRemarks(student.percentage, template) || student.remarks || 'Good academic performance.';
}

export async function generateDocumentsForBatch(
  students: Student[],
  template: DocumentTemplate,
  grade: string,
  onProgress?: (current: number, total: number, name: string) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    onProgress?.(i + 1, students.length, student.name);

    try {
      const text = await callGeminiAPI(student, template, grade);
      results.set(student.id, text);
    } catch {
      results.set(student.id, getFallbackRemarks(student, template));
    }

    // Small delay to avoid rate limiting
    if (i < students.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return results;
}

export async function loadTemplate(docType: string): Promise<DocumentTemplate> {
  const fileMap: { [key: string]: string } = {
    marksheet: '/data/templates/marksheet_template.json',
    leavingCert: '/data/templates/leavingCert_template.json',
    periodicEval: '/data/templates/periodicEval_template.json',
  };

  const path = fileMap[docType];
  if (!path) throw new Error(`Unknown document type: ${docType}`);

  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load template for ${docType}`);

  return response.json() as Promise<DocumentTemplate>;
}

export { callGeminiAPI };

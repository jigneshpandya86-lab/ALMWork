'use client';

import React, { ChangeEvent, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

type MappingField = {
  id: string;
  fieldName: string;
  columnLetter: string;
  x: number;
  y: number;
};

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
};

const DEFAULT_FIELD = (): MappingField => ({
  id: crypto.randomUUID(),
  fieldName: '',
  columnLetter: 'A',
  x: 100,
  y: 100,
});

const sanitizeFileName = (value: string): string => {
  const safe = value.replace(/[\\/:*?"<>|]/g, '_').trim();
  return safe.length > 0 ? safe : 'Student';
};

const LocalExcelProcessor: React.FC = () => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [pdfTemplateBytes, setPdfTemplateBytes] = useState<Uint8Array | null>(null);
  const [pdfTemplateName, setPdfTemplateName] = useState<string>('');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [startRow, setStartRow] = useState<number>(2);
  const [endRow, setEndRow] = useState<number>(2);
  const [fields, setFields] = useState<MappingField[]>([DEFAULT_FIELD()]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isFileSystemApiSupported = typeof window !== 'undefined' && !!(window as PickerWindow).showOpenFilePicker;

  const sheetNames = workbook?.SheetNames ?? [];

  const canGenerate = useMemo(() => {
    if (!workbook || !selectedSheet || !pdfTemplateBytes) return false;
    if (startRow <= 0 || endRow < startRow) return false;
    return fields.every((field) => field.fieldName.trim() && /^[A-Za-z]+$/.test(field.columnLetter.trim()));
  }, [workbook, selectedSheet, pdfTemplateBytes, startRow, endRow, fields]);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const loadWorkbookFromFile = async (file: File): Promise<void> => {
    const buffer = await file.arrayBuffer();
    const parsedWorkbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = parsedWorkbook.SheetNames[0] ?? '';

    setWorkbook(parsedWorkbook);
    setExcelFileName(file.name);
    setSelectedSheet(firstSheet);
    setStartRow(2);
    setEndRow(2);
    resetMessages();
  };

  const handleOpenLocalExcel = async (): Promise<void> => {
    resetMessages();

    try {
      const picker = (window as PickerWindow).showOpenFilePicker;
      if (!picker) {
        setErrorMessage('Native File System Access API is not available in this browser. Please use fallback file input.');
        return;
      }

      const [fileHandle] = await picker({
        types: [
          {
            description: 'Excel Workbook',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });

      const file = await fileHandle.getFile();
      await loadWorkbookFromFile(file);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setErrorMessage('Failed to read selected Excel file. Please try again.');
    }
  };

  const handleFallbackExcelInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    resetMessages();
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await loadWorkbookFromFile(file);
    } catch {
      setErrorMessage('Unable to parse the Excel file. Please verify format and try again.');
    }
  };

  const handlePdfTemplateUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    resetMessages();
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setPdfTemplateBytes(bytes);
      setPdfTemplateName(file.name);
    } catch {
      setErrorMessage('Unable to read the PDF template file.');
    }
  };

  const updateField = (id: string, updates: Partial<MappingField>): void => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const addField = (): void => setFields((prev) => [...prev, DEFAULT_FIELD()]);
  const removeField = (id: string): void => setFields((prev) => prev.filter((field) => field.id !== id));

  const generateBatchPdfs = async (): Promise<void> => {
    if (!workbook || !selectedSheet || !pdfTemplateBytes) {
      setErrorMessage('Please load both an Excel file and PDF template.');
      return;
    }

    if (endRow < startRow) {
      setErrorMessage('End Row must be greater than or equal to Start Row.');
      return;
    }

    resetMessages();
    setIsGenerating(true);

    const zip = new JSZip();
    const missingCells: string[] = [];

    try {
      const sheet = workbook.Sheets[selectedSheet];
      if (!sheet) throw new Error('Selected worksheet does not exist.');

      for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
        const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const page = pdfDoc.getPages()[0];

        if (!page) {
          throw new Error('PDF template has no pages.');
        }

        const valuesForRow: Record<string, string> = {};

        for (const field of fields) {
          const normalizedColumn = field.columnLetter.trim().toUpperCase();
          const cellAddress = `${normalizedColumn}${rowNumber}`;
          const cell = sheet[cellAddress];
          const value = cell ? String(cell.v ?? '').trim() : '';

          if (!value) {
            missingCells.push(`${field.fieldName || normalizedColumn} @ ${cellAddress}`);
          }

          valuesForRow[field.fieldName] = value;
          page.drawText(value || 'N/A', {
            x: field.x,
            y: field.y,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
        }

        const primaryName = fields[0]?.fieldName ? valuesForRow[fields[0].fieldName] : '';
        const fileName = `${sanitizeFileName(primaryName || `Row_${rowNumber}`)}_Certificate.pdf`;
        const pdfBytes = await pdfDoc.save();
        zip.file(fileName, pdfBytes);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'generated-certificates.zip';
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      if (missingCells.length > 0) {
        setSuccessMessage(`PDF generation completed with warnings. ${missingCells.length} empty cell(s) were replaced with N/A.`);
        setErrorMessage(`Empty cells: ${missingCells.slice(0, 10).join(', ')}${missingCells.length > 10 ? ' ...' : ''}`);
      } else {
        setSuccessMessage('Batch PDF generation complete. ZIP download should start automatically.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error during PDF generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Direct Local File Interaction</h2>
      <p className="text-sm text-slate-600">Generate batch PDFs in-browser by mapping local Excel data to a PDF template.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="mb-3 text-lg font-medium text-slate-800">Step A: File Selection</h3>
          <div className="space-y-4">
            <div className="rounded-md border border-dashed border-slate-300 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Excel Source</p>
              <button
                type="button"
                onClick={handleOpenLocalExcel}
                disabled={!isFileSystemApiSupported}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Select Local Excel File
              </button>
              <p className="mt-2 text-xs text-slate-500">{isFileSystemApiSupported ? 'Using Native File System Access API' : 'File System API unavailable'}</p>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Fallback Upload</label>
                <input type="file" accept=".xlsx" onChange={handleFallbackExcelInput} className="block w-full text-sm text-slate-700" />
              </div>

              {excelFileName && <p className="mt-2 text-xs text-emerald-700">Loaded Excel: {excelFileName}</p>}
            </div>

            <div className="rounded-md border border-dashed border-slate-300 p-3">
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload PDF Template</label>
              <input type="file" accept=".pdf" onChange={handlePdfTemplateUpload} className="block w-full text-sm text-slate-700" />
              {pdfTemplateName && <p className="mt-2 text-xs text-emerald-700">Template: {pdfTemplateName}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="mb-3 text-lg font-medium text-slate-800">Step B: Mapping Configuration</h3>

          {workbook ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sheet Selector</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {sheetNames.map((sheet) => (
                    <option key={sheet} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Start Row</label>
                  <input type="number" min={1} value={startRow} onChange={(e) => setStartRow(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">End Row</label>
                  <input type="number" min={1} value={endRow} onChange={(e) => setEndRow(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Data Mapping</p>
                  <button type="button" onClick={addField} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">+ Add Field</button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-md border border-slate-200 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Field {index + 1}</p>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => removeField(field.id)} className="text-xs font-medium text-rose-600 hover:text-rose-700">Remove</button>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Field Name"
                          value={field.fieldName}
                          onChange={(e) => updateField(field.id, { fieldName: e.target.value })}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Excel Column (A, B, AA...)"
                          value={field.columnLetter}
                          onChange={(e) => updateField(field.id, { columnLetter: e.target.value.toUpperCase() })}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="X"
                          value={field.x}
                          onChange={(e) => updateField(field.id, { x: Number(e.target.value) })}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Y"
                          value={field.y}
                          onChange={(e) => updateField(field.id, { y: Number(e.target.value) })}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Load an Excel workbook to configure sheet, rows, and field mappings.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="mb-3 text-lg font-medium text-slate-800">Step C: Generation Engine</h3>
        <button
          type="button"
          onClick={generateBatchPdfs}
          disabled={!canGenerate || isGenerating}
          className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isGenerating ? 'Generating...' : 'Generate Batch PDFs'}
        </button>
      </div>

      {errorMessage && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</div>}
      {successMessage && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}
    </section>
  );
};

export default LocalExcelProcessor;

'use client';

import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import JSZip from 'jszip';
import TemplateSelector from '@/components/TemplateSelector';
import FileUploader from '@/components/FileUploader';
import ProgressBar from '@/components/ProgressBar';
import MasterReportTemplate from '@/components/MasterReportTemplate';
import { CsvRow, ReportBlueprint } from '@/types';
import { parseCSVAndMap } from '@/lib/csvParser';

type ReportDesignFile = {
  reports: ReportBlueprint[];
};

async function renderBlueprintRowToPdfBlob(blueprint: ReportBlueprint, row: CsvRow): Promise<Blob> {
  const [html2canvasModule, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const html2canvas = html2canvasModule.default;

  const mount = document.createElement('div');
  mount.style.position = 'fixed';
  mount.style.left = '-99999px';
  mount.style.top = '0';
  mount.style.background = '#fff';
  mount.style.width = blueprint.layout === 'landscape' ? '1123px' : '794px';
  document.body.appendChild(mount);

  const root = createRoot(mount);
  try {
    root.render(<MasterReportTemplate blueprint={blueprint} parsedCsvData={[row]} />);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    await new Promise((resolve) => setTimeout(resolve, 80));

    const element = mount.firstElementChild as HTMLElement | null;
    if (!element) throw new Error('Template render failed.');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const orientation = blueprint.layout === 'landscape' ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageData = canvas.toDataURL('image/png');
    const renderedHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, renderedHeight, undefined, 'FAST');
    if (renderedHeight > pageHeight) {
      let remainingHeight = renderedHeight - pageHeight;
      let position = -pageHeight;
      while (remainingHeight > 0) {
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, renderedHeight, undefined, 'FAST');
        remainingHeight -= pageHeight;
        position -= pageHeight;
      }
    }

    return pdf.output('blob');
  } finally {
    root.unmount();
    mount.remove();
  }
}

function safeFilePart(value: unknown, fallback: string): string {
  const raw = String(value ?? fallback).trim();
  return raw.replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/_+/g, '_') || fallback;
}

export default function HomePage() {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState('Ready');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => Boolean(selectedTemplateKey && uploadedFile && !isGenerating), [selectedTemplateKey, uploadedFile, isGenerating]);

  const handleGenerate = async () => {
    if (!selectedTemplateKey || !uploadedFile) {
      setError('Please select a template and upload a CSV file.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgressStatus('Parsing CSV...');
    setProgressPercent(2);

    try {
      const templateResponse = await fetch('/data/templates/report_designs.json');
      if (!templateResponse.ok) {
        throw new Error('Unable to load report designs.');
      }

      const templateJson = (await templateResponse.json()) as ReportDesignFile;
      const selectedBlueprint = templateJson.reports.find((report) => report.id === selectedTemplateKey);
      if (!selectedBlueprint) {
        throw new Error('Selected template was not found in report designs.');
      }

      const { csvData, mappedBlueprint } = await parseCSVAndMap(uploadedFile, selectedBlueprint);
      if (csvData.length === 0) {
        throw new Error('CSV file has no usable rows.');
      }

      const zip = new JSZip();
      const totalRows = csvData.length;

      let index = 0;
      for (const row of csvData) {
        setProgressStatus(`Generating document ${index + 1} of ${totalRows}...`);
        setProgressPercent(Math.round(((index + 1) / totalRows) * 92));

        const pdfBlob = await renderBlueprintRowToPdfBlob(mappedBlueprint, row);
        const roll = safeFilePart(row.roll_no ?? row.rollno, `row_${index + 1}`);
        const name = safeFilePart(row.name, 'student');
        zip.file(`${roll}_${name}.pdf`, pdfBlob);

        await new Promise((resolve) => setTimeout(resolve, 150));
        index += 1;
      }

      setProgressStatus('Compressing Files...');
      setProgressPercent(96);
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Batch_Reports.zip';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setProgressStatus('Complete!');
      setProgressPercent(100);
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Batch generation failed.';
      setError(message);
      setProgressStatus('Failed. Please check your CSV/template and retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-xl bg-white shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 text-center">SchoolDocGenie Batch Report Generator</h1>
        <TemplateSelector value={selectedTemplateKey} onChange={setSelectedTemplateKey} />
        <FileUploader file={uploadedFile} onFileSelected={setUploadedFile} />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate ZIP'}
        </button>

        <ProgressBar progressStatus={progressStatus} percentage={progressPercent} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>
    </main>
  );
}

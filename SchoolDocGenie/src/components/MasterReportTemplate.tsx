import React from 'react';
import {
  DesignBlockConfig,
  NarrativeTextBlockConfig,
  ReportBlueprint,
  TableBlockConfig,
  StudentMetaBlockConfig,
} from '@/types';
import { extractDynamicColumns } from '@/lib/csvParser';
import DynamicTableBlock from './report-blocks/DynamicTableBlock';
import SchoolHeaderBlock from './report-blocks/SchoolHeaderBlock';
import SignatureFooterBlock from './report-blocks/SignatureFooterBlock';
import StudentMetaBlock from './report-blocks/StudentMetaBlock';

type MasterReportTemplateProps = {
  blueprint: ReportBlueprint;
  parsedCsvData: Record<string, unknown>[];
};

function resolveRows(block: TableBlockConfig, parsedCsvData: Record<string, unknown>[]): Record<string, unknown>[] {
  if (block.rowSource === 'firstRow') {
    return parsedCsvData[0] ? [parsedCsvData[0]] : [];
  }

  return parsedCsvData;
}

function resolveMetaRow(block: StudentMetaBlockConfig, parsedCsvData: Record<string, unknown>[]): Record<string, unknown> {
  if (block.dataMode === 'allRows') {
    return {
      recordCount: parsedCsvData.length,
    };
  }

  return parsedCsvData[0] ?? {};
}

function renderNarrativeBlock(block: NarrativeTextBlockConfig): JSX.Element {
  return <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.text}</p>;
}

function renderDesignBlock(block: DesignBlockConfig, parsedCsvData: Record<string, unknown>[]): JSX.Element | null {
  switch (block.type) {
    case 'header':
      return <SchoolHeaderBlock config={block.header} />;
    case 'studentMeta':
      return <StudentMetaBlock title={block.title} fields={block.fields} rowData={resolveMetaRow(block, parsedCsvData)} />;
    case 'table': {
      const resolvedRows = resolveRows(block, parsedCsvData);
      const resolvedColumns = block.columns && block.columns.length > 0
        ? block.columns
        : extractDynamicColumns(resolvedRows);

      return <DynamicTableBlock title={block.title} columns={resolvedColumns} rowData={resolvedRows} />;
    }
    case 'signatures':
      return <SignatureFooterBlock labels={block.labels} />;
    case 'narrativeText':
      return renderNarrativeBlock(block);
    default:
      return null;
  }
}

const MasterReportTemplate: React.FC<MasterReportTemplateProps> = ({ blueprint, parsedCsvData }) => {
  const pageWidthClass = blueprint.layout === 'landscape' ? 'w-[1123px] min-h-[794px]' : 'w-[794px] min-h-[1123px]';

  return (
    <div className={`${pageWidthClass} bg-white text-slate-900 p-8 space-y-5`}>
      {blueprint.designBlocks.map((block) => (
        <section key={block.id} className={block.className ?? ''}>
          {renderDesignBlock(block, parsedCsvData)}
        </section>
      ))}
    </div>
  );
};

export default MasterReportTemplate;

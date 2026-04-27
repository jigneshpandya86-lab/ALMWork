'use client';

import React from 'react';
import { TemplateSelectorProps, DocType } from '@/types';

const DOC_TYPES: { id: DocType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'marksheet',
    label: 'Marksheet',
    description: 'Subject-wise marks, percentage, grade point & teacher remarks.',
    color: 'indigo',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'leavingCert',
    label: 'Leaving Certificate',
    description: 'Official character certificate with student details.',
    color: 'violet',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    id: 'periodicEval',
    label: 'Periodic Evaluation',
    description: 'Term-wise evaluation with detailed performance analysis.',
    color: 'blue',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; text: string }> = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-700',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    border: 'border-violet-500',
    text: 'text-violet-700',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-700',
  },
};

const GRADES = ['6', '7', '8'];

export default function TemplateSelector({ onSelect, selectedDocType, selectedGrade }: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Document type */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Document Type</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DOC_TYPES.map((dt) => {
            const c = colorMap[dt.color];
            const selected = selectedDocType === dt.id;
            return (
              <button
                key={dt.id}
                onClick={() => onSelect(dt.id, selectedGrade ?? '6')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-150 group
                  ${selected
                    ? `${c.border} ${c.bg}`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors
                  ${selected ? c.bg : 'bg-slate-100 group-hover:bg-slate-200'}
                  ${selected ? c.icon : 'text-slate-500'}`}>
                  {dt.icon}
                </div>
                <p className={`font-semibold text-sm mb-1 ${selected ? c.text : 'text-slate-700'}`}>
                  {dt.label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">{dt.description}</p>
                {selected && (
                  <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${c.text}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade selector */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Grade</p>
        <div className="flex gap-3">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => onSelect(selectedDocType ?? 'marksheet', g)}
              className={`flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all duration-150
                ${selectedGrade === g
                  ? 'border-transparent text-white shadow-lg'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 bg-white'
                }`}
              style={selectedGrade === g
                ? { background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }
                : {}}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

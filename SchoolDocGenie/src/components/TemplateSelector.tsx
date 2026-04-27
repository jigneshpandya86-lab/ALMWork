'use client';

import React from 'react';
import { TemplateSelectorProps, DocType } from '@/types';

const DOC_TYPES: { id: DocType; label: string; description: string; icon: string }[] = [
  {
    id: 'marksheet',
    label: 'Marksheet',
    description: 'Annual report card with subject-wise marks, percentage, grade point, and teacher remarks.',
    icon: '📋',
  },
  {
    id: 'leavingCert',
    label: 'Leaving Certificate',
    description: 'Official school leaving certificate with student details and character assessment.',
    icon: '📜',
  },
  {
    id: 'periodicEval',
    label: 'Periodic Evaluation',
    description: 'Term-wise evaluation report with detailed performance analysis and suggestions.',
    icon: '📊',
  },
];

const GRADES = ['6', '7', '8'];

export default function TemplateSelector({ onSelect, selectedDocType, selectedGrade }: TemplateSelectorProps) {
  const handleSelect = (docType: DocType, grade: string) => {
    onSelect(docType, grade);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Document Type</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt.id}
              onClick={() => handleSelect(dt.id, selectedGrade ?? '6')}
              className={`p-4 rounded-xl border-2 text-left transition-all
                ${selectedDocType === dt.id
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
            >
              <div className="text-2xl mb-2">{dt.icon}</div>
              <p className={`font-semibold text-sm ${selectedDocType === dt.id ? 'text-blue-700' : 'text-gray-700'}`}>
                {dt.label}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{dt.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Select Grade</p>
        <div className="flex gap-3">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => handleSelect(selectedDocType ?? 'marksheet', g)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-lg transition-all
                ${selectedGrade === g
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}
            >
              Grade {g}
            </button>
          ))}
        </div>
      </div>

      {selectedDocType && selectedGrade && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>
            Selected: <strong>{DOC_TYPES.find((d) => d.id === selectedDocType)?.label}</strong> for{' '}
            <strong>Grade {selectedGrade}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

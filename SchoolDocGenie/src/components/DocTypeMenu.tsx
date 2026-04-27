'use client';

import React, { useState } from 'react';
import { DocType } from '@/types';

interface DocTypeMenuProps {
  selectedDocType: DocType | null;
  onSelect: (docType: DocType) => void;
}

const DOC_TYPES = [
  { id: 'marksheet' as DocType, label: 'Marksheet', icon: '📋', desc: 'Subject-wise marks & grades' },
  { id: 'leavingCert' as DocType, label: 'Leaving Certificate', icon: '🎓', desc: 'Character & conduct cert' },
  { id: 'periodicEval' as DocType, label: 'Periodic Evaluation', icon: '📊', desc: 'Term-wise performance' },
  { id: 'attendanceRegister' as DocType, label: 'Attendance Register', icon: '📅', desc: 'Calendar-based attendance' },
];

export default function DocTypeMenu({ selectedDocType, onSelect }: DocTypeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors"
        style={{
          background: isOpen ? 'rgba(79,70,229,0.1)' : 'transparent',
          color: '#4f46e5',
        }}
        title="Document Types"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="absolute top-full right-0 mt-1 w-56 rounded-lg shadow-lg z-50"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(199,210,254,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {DOC_TYPES.map(doc => (
              <button
                key={doc.id}
                onClick={() => {
                  onSelect(doc.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-start gap-3 transition-colors border-b last:border-b-0"
                style={{
                  background: selectedDocType === doc.id ? 'rgba(79,70,229,0.08)' : 'transparent',
                  borderColor: 'rgba(199,210,254,0.3)',
                }}
                onMouseEnter={e => {
                  if (selectedDocType !== doc.id) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = selectedDocType === doc.id ? 'rgba(79,70,229,0.08)' : 'transparent';
                }}
              >
                <span className="text-lg flex-shrink-0">{doc.icon}</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-slate-800">{doc.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                </div>
                {selectedDocType === doc.id && (
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

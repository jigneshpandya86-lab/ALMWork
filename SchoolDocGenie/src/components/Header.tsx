'use client';

import React, { useState } from 'react';
import { DocType } from '@/types';
import DocTypeMenu from './DocTypeMenu';

const NAV = [
  { href: '#step-upload', label: 'Upload' },
  { href: '#step-preview', label: 'Students' },
  { href: '#step-select', label: 'Templates' },
  { href: '#step-generate', label: 'Generate' },
];

const QUICK_ACTIONS = [
  { href: '#step-upload', label: 'Add data' },
  { href: '#step-generate', label: 'Generate PDFs' },
  { href: '#step-preview', label: 'Manage students' },
];

export default function Header() {
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-5 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#146eb4,#ff9900)' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">SchoolDocGenie</span>
            <p className="text-[11px] text-slate-500 leading-none">Fast document operations</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href} className="nav-step-link font-semibold">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <a href="#step-generate" className="btn-amazon text-xs px-3 py-2 rounded-md font-bold">Quick Generate</a>
          <DocTypeMenu selectedDocType={selectedDocType} onSelect={setSelectedDocType} />
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-200 text-slate-700"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {NAV.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-semibold text-slate-700 px-3 py-2 rounded-md border border-slate-200 bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="border border-slate-200 rounded-lg p-2">
            <p className="text-xs font-bold text-slate-500 px-1 pb-2">Quick actions</p>
            <div className="space-y-1">
              {QUICK_ACTIONS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-slate-700 px-2 py-2 rounded-md hover:bg-slate-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

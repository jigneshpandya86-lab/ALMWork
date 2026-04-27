'use client';

import React, { useState } from 'react';
import { DocType } from '@/types';
import DocTypeMenu from './DocTypeMenu';

const NAV = [
  { href: '#step-upload',   label: 'Upload' },
  { href: '#step-preview',  label: 'Preview' },
  { href: '#step-select',   label: 'Select Type' },
  { href: '#step-generate', label: 'Generate' },
];

export default function Header() {
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);

  return (
    <header className="sticky top-0 z-50" style={{
      background: 'rgba(255,255,255,0.80)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(199,210,254,0.5)',
    }}>
      <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">
            School<span className="grad-text">Doc</span>Genie
          </span>
        </div>

        {/* Step nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              className="nav-step-link">
              {label}
            </a>
          ))}
        </nav>

        {/* Doc type menu + badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <DocTypeMenu selectedDocType={selectedDocType} onSelect={setSelectedDocType} />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background:'rgba(79,70,229,0.08)', color:'#4f46e5', border:'1px solid rgba(79,70,229,0.15)' }}>
            v1.0
          </div>
        </div>
      </div>
    </header>
  );
}

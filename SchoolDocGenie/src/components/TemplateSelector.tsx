'use client';

import React from 'react';
import { TemplateSelectorProps, DocType } from '@/types';

const DOCS: {
  id: DocType; label: string; desc: string;
  gradient: string; lightBg: string; textColor: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'marksheet',
    label: 'Marksheet',
    desc: 'Subject-wise marks, percentage, grade point, and teacher remarks.',
    gradient: 'linear-gradient(135deg,#4f46e5,#6366f1)',
    lightBg: 'rgba(99,102,241,0.08)',
    textColor: '#4f46e5',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
  },
  {
    id: 'leavingCert',
    label: 'Leaving Certificate',
    desc: 'Official character certificate with student background and serial number.',
    gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    lightBg: 'rgba(124,58,237,0.08)',
    textColor: '#7c3aed',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
      </svg>
    ),
  },
  {
    id: 'periodicEval',
    label: 'Periodic Evaluation',
    desc: 'Term-wise report with detailed performance analysis and suggestions.',
    gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)',
    lightBg: 'rgba(37,99,235,0.08)',
    textColor: '#2563eb',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
  },

  {
    id: 'std6PaMathsAttendance',
    label: 'STD6 PA Maths',
    desc: 'Periodic Assessment sheet for Std 6 Mathematics.',
    gradient: 'linear-gradient(135deg,#0ea5e9,#3b82f6)',
    lightBg: 'rgba(59,130,246,0.08)',
    textColor: '#2563eb',
    icon: <span className="text-sm font-black">6M</span>,
  },
  {
    id: 'std6PaSciAttendance',
    label: 'STD6 PA Science',
    desc: 'Periodic Assessment sheet for Std 6 Science.',
    gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)',
    lightBg: 'rgba(6,182,212,0.08)',
    textColor: '#0e7490',
    icon: <span className="text-sm font-black">6S</span>,
  },
  {
    id: 'std7PaMathsAttendance',
    label: 'STD7 PA Maths',
    desc: 'Periodic Assessment sheet for Std 7 Mathematics.',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    lightBg: 'rgba(139,92,246,0.08)',
    textColor: '#6d28d9',
    icon: <span className="text-sm font-black">7M</span>,
  },
  {
    id: 'std7PaSciAttendance',
    label: 'STD7 PA Science',
    desc: 'Periodic Assessment sheet for Std 7 Science.',
    gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    lightBg: 'rgba(168,85,247,0.08)',
    textColor: '#7e22ce',
    icon: <span className="text-sm font-black">7S</span>,
  },
  {
    id: 'std8PaMathsAttendance',
    label: 'STD8 PA Maths',
    desc: 'Periodic Assessment sheet for Std 8 Mathematics.',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    lightBg: 'rgba(249,115,22,0.08)',
    textColor: '#ea580c',
    icon: <span className="text-sm font-black">8M</span>,
  },
  {
    id: 'std8PaSciAttendance',
    label: 'STD8 PA Science',
    desc: 'Periodic Assessment sheet for Std 8 Science.',
    gradient: 'linear-gradient(135deg,#ef4444,#f97316)',
    lightBg: 'rgba(239,68,68,0.08)',
    textColor: '#dc2626',
    icon: <span className="text-sm font-black">8S</span>,
  },
  {
    id: 'attendanceRegister',
    label: 'Attendance Register',
    desc: 'Calendar-based attendance register with leave marking.',
    gradient: 'linear-gradient(135deg,#059669,#10b981)',
    lightBg: 'rgba(16,185,129,0.08)',
    textColor: '#059669',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
];

const GRADES = ['6', '7', '8'];

export default function TemplateSelector({ onSelect, selectedDocType, selectedGrade }: TemplateSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Doc types */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Document Type</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map((d) => {
            const active = selectedDocType === d.id;
            return (
              <button key={d.id} onClick={() => onSelect(d.id, selectedGrade ?? '6')}
                className="text-left rounded-xl px-3 py-2.5 transition-all duration-200 group"
                style={{
                  border: active ? `2px solid ${d.textColor}` : '2px solid rgba(226,232,240,0.8)',
                  background: active ? d.lightBg : 'rgba(255,255,255,0.7)',
                  boxShadow: active ? `0 3px 16px ${d.lightBg.replace('0.08','0.22')}` : 'none',
                  transform: active ? 'translateY(-1px)' : 'translateY(0)',
                }}>
                <div className="flex items-center gap-2.5">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                  style={{
                    background: active ? d.gradient : 'rgba(241,245,249,0.8)',
                    color: active ? '#fff' : '#94a3b8',
                  }}>
                    {d.icon}
                  </div>
                  <p className="font-bold text-sm leading-tight flex-1" style={{ color: active ? d.textColor : '#334155' }}>
                    {d.label}
                  </p>
                  {active && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: d.textColor }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Grade</p>
        <div className="flex gap-2.5">
          {GRADES.map((g) => {
            const active = selectedGrade === g;
            return (
              <button key={g} onClick={() => onSelect(selectedDocType ?? 'marksheet', g)}
                className="flex-1 py-2.5 rounded-xl font-black text-3xl transition-all duration-200"
                style={{
                  background: active ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.8)',
                  color: active ? '#fff' : '#94a3b8',
                  border: active ? 'none' : '1.5px solid #e2e8f0',
                  boxShadow: active ? '0 4px 16px rgba(79,70,229,0.3)' : 'none',
                  transform: active ? 'translateY(-1px)' : 'translateY(0)',
                }}>
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary pill */}
      {selectedDocType && selectedGrade && (
        <div className="flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2.5"
          style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#059669' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Ready to generate&nbsp;
          <strong>{DOCS.find(d => d.id === selectedDocType)?.label}</strong>
          &nbsp;for&nbsp;<strong>Grade {selectedGrade}</strong>
        </div>
      )}
    </div>
  );
}

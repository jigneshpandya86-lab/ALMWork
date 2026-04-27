'use client';

import React, { useState, useMemo } from 'react';
import { StudentTableProps } from '@/types';

const PAGE_SIZE = 50;

const GP_STYLE: Record<string, { bg: string; color: string }> = {
  'A+': { bg:'rgba(16,185,129,0.12)',  color:'#059669' },
  'A':  { bg:'rgba(37,99,235,0.12)',   color:'#1d4ed8' },
  'B+': { bg:'rgba(20,184,166,0.12)',  color:'#0f766e' },
  'B':  { bg:'rgba(234,179,8,0.12)',   color:'#a16207' },
  'B-': { bg:'rgba(245,158,11,0.12)',  color:'#b45309' },
  'C+': { bg:'rgba(249,115,22,0.12)',  color:'#c2410c' },
  'C':  { bg:'rgba(239,68,68,0.12)',   color:'#dc2626' },
  'D':  { bg:'rgba(220,38,38,0.15)',   color:'#b91c1c' },
  'F':  { bg:'rgba(185,28,28,0.18)',   color:'#991b1b' },
};

export default function StudentTable({ students, selectedGrade }: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = selectedGrade ? students.filter(s => s.grade === selectedGrade) : students;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.rollno.toLowerCase().includes(q));
    }
    return list;
  }, [students, selectedGrade, search]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const gradeColor: Record<string, string> = {
    'A+': 'bg-green-100 text-green-800',
    A: 'bg-blue-100 text-blue-800',
    'B+': 'bg-teal-100 text-teal-800',
    B: 'bg-yellow-100 text-yellow-800',
    'C+': 'bg-orange-100 text-orange-800',
    C: 'bg-red-100 text-red-800',
    D: 'bg-red-200 text-red-900',
    'B-': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">
            <span className="font-bold text-slate-800">{filtered.length}</span> students
          </span>
          {Object.entries(byGrade).sort().map(([g, n]) => (
            <span key={g} className="badge"
              style={{ background:'rgba(79,70,229,0.1)', color:'#4f46e5', border:'1px solid rgba(79,70,229,0.15)' }}>
              Grade {g}: {n}
            </span>
          ))}
        </div>
        <div className="sm:ml-auto relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text" placeholder="Search name or roll no…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 rounded-xl text-sm w-full sm:w-56 outline-none transition-all"
            style={{
              background:'rgba(255,255,255,0.8)',
              border:'1.5px solid #e2e8f0',
            }}
            onFocus={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'; }}
            onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none'; }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(199,210,254,0.5)', boxShadow:'0 2px 12px rgba(79,70,229,0.06)' }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {['#','Name','Roll','Grade','%','Grade','Attend.','Conduct'].map(h => (
                <th key={h} className="py-3.5 px-4 text-left text-xs font-bold text-white/80 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-300 text-sm">No students found</td></tr>
            ) : rows.map((s, i) => {
              const gp = GP_STYLE[s.gradePoint] ?? { bg:'rgba(148,163,184,0.12)', color:'#475569' };
              return (
                <tr key={s.id} className="table-row transition-colors"
                  style={{ background: i%2===0 ? 'rgba(255,255,255,0.9)' : 'rgba(248,250,252,0.8)' }}>
                  <td className="py-3 px-4 text-slate-400 text-xs tabular-nums">{(page-1)*PAGE_SIZE+i+1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums">{s.rollno}</td>
                  <td className="py-3 px-4">
                    <span className="badge" style={{ background:'rgba(79,70,229,0.08)', color:'#4338ca' }}>
                      Gr {s.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700 tabular-nums">{s.percentage}%</td>
                  <td className="py-3 px-4">
                    <span className="badge font-bold" style={{ background: gp.bg, color: gp.color }}>
                      {s.gradePoint}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums">{s.attendance}%</td>
                  <td className="py-3 px-4 text-slate-500">{s.conduct}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[
            { label:'← Prev', action:() => setPage(p => Math.max(1,p-1)), disabled: page===1 },
            { label:'Next →', action:() => setPage(p => Math.min(pages,p+1)), disabled: page===pages },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} disabled={btn.disabled}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: btn.disabled ? 'rgba(241,245,249,0.6)' : 'rgba(255,255,255,0.8)',
                border: '1.5px solid #e2e8f0',
                color: btn.disabled ? '#cbd5e1' : '#4f46e5',
                cursor: btn.disabled ? 'not-allowed' : 'pointer',
              }}>
              {btn.label}
            </button>
          ))}
          <span className="text-sm text-slate-400 px-2">Page {page} of {pages}</span>
        </div>
      )}
    </div>
  );
}

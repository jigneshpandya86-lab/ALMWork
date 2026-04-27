'use client';

import React, { useState, useMemo } from 'react';
import { StudentTableProps } from '@/types';

const PAGE_SIZE = 50;

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  'A+': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'A':  { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  'B+': { bg: 'bg-teal-100',    text: 'text-teal-700'    },
  'B':  { bg: 'bg-sky-100',     text: 'text-sky-700'     },
  'B-': { bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
  'C+': { bg: 'bg-orange-100',  text: 'text-orange-700'  },
  'C':  { bg: 'bg-red-100',     text: 'text-red-600'     },
  'D':  { bg: 'bg-red-200',     text: 'text-red-700'     },
  'F':  { bg: 'bg-red-300',     text: 'text-red-800'     },
};

export default function StudentTable({ students, selectedGrade }: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = selectedGrade ? students.filter((s) => s.grade === selectedGrade) : students;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) || s.rollno.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, selectedGrade, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Grade distribution summary
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((s) => { counts[s.grade] = (counts[s.grade] ?? 0) + 1; });
    return counts;
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Summary chips + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{students.length}</span> students
          </span>
          {Object.entries(gradeCounts).sort().map(([g, n]) => (
            <span key={g} className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
              Grade {g}: {n}
            </span>
          ))}
        </div>
        <div className="sm:ml-auto relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name or roll no…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm w-full sm:w-56
              focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}>
              {['#', 'Name', 'Roll No', 'Grade', '%', 'GP', 'Attendance', 'Conduct'].map((h) => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-300 text-sm">
                  No students match your search
                </td>
              </tr>
            ) : (
              paginated.map((student, idx) => {
                const gp = GRADE_COLORS[student.gradePoint] ?? { bg: 'bg-slate-100', text: 'text-slate-600' };
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-xs tabular-nums">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{student.name}</td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{student.rollno}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        Gr {student.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 tabular-nums">
                      {student.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gp.bg} ${gp.text}`}>
                        {student.gradePoint}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{student.attendance}%</td>
                    <td className="py-3 px-4 text-slate-500">{student.conduct}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600
              hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 px-2">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600
              hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

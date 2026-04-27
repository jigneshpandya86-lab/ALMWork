'use client';

import React, { useState, useMemo } from 'react';
import { StudentTableProps } from '@/types';

const PAGE_SIZE = 50;

export default function StudentTable({ students, selectedGrade }: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = selectedGrade ? students.filter((s) => s.grade === selectedGrade) : students;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.rollno.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, selectedGrade, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of{' '}
          <span className="font-semibold text-gray-800">{students.length}</span> students
          {selectedGrade && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Grade {selectedGrade}
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="Search by name or roll no…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 text-left font-semibold">#</th>
              <th className="py-3 px-4 text-left font-semibold">Name</th>
              <th className="py-3 px-4 text-left font-semibold">Roll No</th>
              <th className="py-3 px-4 text-left font-semibold">Grade</th>
              <th className="py-3 px-4 text-left font-semibold">Percentage</th>
              <th className="py-3 px-4 text-left font-semibold">Grade Point</th>
              <th className="py-3 px-4 text-left font-semibold">Attendance</th>
              <th className="py-3 px-4 text-left font-semibold">Conduct</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No students found
                </td>
              </tr>
            ) : (
              paginated.map((student, idx) => (
                <tr
                  key={student.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="py-2.5 px-4 text-gray-400">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-gray-800">{student.name}</td>
                  <td className="py-2.5 px-4 text-gray-600">{student.rollno}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      Grade {student.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-gray-800">
                    {student.percentage}%
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        gradeColor[student.gradePoint] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {student.gradePoint}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">{student.attendance}%</td>
                  <td className="py-2.5 px-4 text-gray-600">{student.conduct}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

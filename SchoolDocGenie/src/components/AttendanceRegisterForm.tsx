'use client';

import React, { useMemo, useState } from 'react';
import { Student } from '@/types';

interface AttendanceRegisterFormProps {
  students: Student[];
  grade: string;
  onGenerate: (studentAttendance: Map<string, { month: number; year: number; days: boolean[] }>) => void;
  onClose: () => void;
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const MONTHS_GJ = ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
  'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'];

export default function AttendanceRegisterForm({ students, grade, onGenerate, onClose }: AttendanceRegisterFormProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const gradeStudents = students.filter(s => s.grade === grade);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const sundayDays = useMemo(() => {
    const values: number[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
      if (dayOfWeek === 0) values.push(day);
    }
    return values;
  }, [daysInMonth, selectedMonth, selectedYear]);

  const handleGenerate = () => {
    const result = new Map<string, { month: number; year: number; days: boolean[] }>();
    const days = Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const dayNumber = dayIndex + 1;
      const dayOfWeek = new Date(selectedYear, selectedMonth, dayNumber).getDay();
      return dayOfWeek === 0;
    });

    gradeStudents.forEach(s => {
      result.set(s.id, {
        month: selectedMonth,
        year: selectedYear,
        days,
      });
    });
    onGenerate(result);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto max-w-3xl w-full">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Attendance Register</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select standard, month and year for monthly attendance print</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Standard</label>
              <div className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-700">
                {grade}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {MONTHS_EN.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-800" style={{ fontFamily: '"Noto Sans Gujarati", sans-serif' }}>
              {MONTHS_GJ[selectedMonth]} {selectedYear}
            </p>
            <p className="text-sm text-slate-500 mt-1">{MONTHS_EN[selectedMonth]} {selectedYear}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">Students in selected standard</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{gradeStudents.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Sundays auto-marked</p>
                <p className="text-lg font-bold text-emerald-700 mt-1">{sundayDays.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg transition"
            >
              Generate Monthly Attendance PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

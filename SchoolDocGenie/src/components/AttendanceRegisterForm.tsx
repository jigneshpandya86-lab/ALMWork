'use client';

import React, { useState, useEffect } from 'react';
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
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');
  const [attendance, setAttendance] = useState<Map<string, boolean[]>>(new Map());

  const gradeStudents = students.filter(s => s.grade === grade);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const studentAttendance = attendance.get(selectedStudent) || Array(daysInMonth).fill(false);

  const toggleDay = (day: number, present: boolean) => {
    const updated = [...studentAttendance];
    updated[day] = present;
    const newAttendance = new Map(attendance);
    newAttendance.set(selectedStudent, updated);
    setAttendance(newAttendance);
  };

  const handleGenerate = () => {
    const result = new Map<string, { month: number; year: number; days: boolean[] }>();
    gradeStudents.forEach(s => {
      result.set(s.id, {
        month: selectedMonth,
        year: selectedYear,
        days: attendance.get(s.id) || Array(daysInMonth).fill(false),
      });
    });
    onGenerate(result);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto max-w-3xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Attendance Register</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select month, year, and student to mark attendance</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg transition">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-3 gap-4">
            {/* Student select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Student</label>
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {gradeStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Month select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {MONTHS_EN.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar title */}
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800" style={{ fontFamily: '"Noto Sans Gujarati", sans-serif' }}>
              {MONTHS_GJ[selectedMonth]} {selectedYear}
            </p>
            <p className="text-sm text-slate-500 mt-1">{MONTHS_EN[selectedMonth]} {selectedYear}</p>
          </div>

          {/* Calendar grid */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-3">Mark attendance: <span className="text-emerald-600 font-bold">Green = Present</span>, <span className="text-slate-400">Gray = Absent/Leave</span></p>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: daysInMonth }).map((_, day) => {
                const isPresent = studentAttendance[day] || false;
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day, !isPresent)}
                    className="aspect-square rounded-lg text-sm font-bold transition-all border-2"
                    style={{
                      background: isPresent ? '#d1fae5' : '#f3f4f6',
                      color: isPresent ? '#059669' : '#9ca3af',
                      borderColor: isPresent ? '#10b981' : '#e5e7eb',
                    }}
                  >
                    {day + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Present days marked for <strong>{gradeStudents.find(s => s.id === selectedStudent)?.name}</strong></p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {studentAttendance.filter(d => d).length} / {daysInMonth} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Attendance %</p>
                <p className="text-3xl font-black text-slate-800">
                  {Math.round((studentAttendance.filter(d => d).length / daysInMonth) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              Generate PDFs for All Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

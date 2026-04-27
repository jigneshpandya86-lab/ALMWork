'use client';

import React, { useState, useMemo } from 'react';
import { Student, StudentTableProps } from '@/types';

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

type StudentDraft = {
  name: string;
  rollno: string;
  grade: string;
  gender: string;
  caste: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  address: string;
  attendance: string;
  conduct: string;
};

const EMPTY_DRAFT: StudentDraft = {
  name: '',
  rollno: '',
  grade: '6',
  gender: '',
  caste: '',
  dateOfBirth: '',
  fatherName: '',
  motherName: '',
  address: '',
  attendance: '0',
  conduct: 'Good',
};

export default function StudentTable({ students, selectedGrade, onSaveStudent, onDeleteStudent }: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [draft, setDraft] = useState<StudentDraft>(EMPTY_DRAFT);

  const filtered = useMemo(() => {
    let list = selectedGrade ? students.filter(s => s.grade === selectedGrade) : students;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q)
        || s.rollno.toLowerCase().includes(q)
        || s.gender.toLowerCase().includes(q)
        || s.caste.toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, selectedGrade, search]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const byGrade = useMemo(() => {
    const m: Record<string,number> = {};
    filtered.forEach(s => { m[s.grade] = (m[s.grade] ?? 0) + 1; });
    return m;
  }, [filtered]);

  const openAdd = () => {
    setEditingStudent(null);
    setDraft({ ...EMPTY_DRAFT, grade: selectedGrade ?? '6' });
    setIsEditorOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setDraft({
      name: student.name,
      rollno: student.rollno,
      grade: student.grade,
      gender: student.gender,
      caste: student.caste,
      dateOfBirth: student.dateOfBirth,
      fatherName: student.fatherName,
      motherName: student.motherName,
      address: student.address,
      attendance: String(student.attendance),
      conduct: student.conduct,
    });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingStudent(null);
    setDraft(EMPTY_DRAFT);
  };

  const saveStudent = () => {
    if (!draft.name.trim() || !draft.rollno.trim() || !draft.grade.trim()) {
      return;
    }

    const base: Student = editingStudent ?? {
      id: `STU-${Date.now()}`,
      marks: { hindi: 0, english: 0, mathematics: 0, science: 0, socialStudies: 0 },
      totalMarks: 0,
      percentage: 0,
      gradePoint: 'F',
      remarks: '',
      attendance: 0,
      conduct: 'Good',
      name: '',
      rollno: '',
      grade: '',
      gender: '',
      caste: '',
      dateOfBirth: '',
      fatherName: '',
      motherName: '',
      address: '',
    };

    onSaveStudent(
      {
        ...base,
        name: draft.name.trim(),
        rollno: draft.rollno.trim(),
        grade: draft.grade,
        gender: draft.gender.trim(),
        caste: draft.caste.trim(),
        dateOfBirth: draft.dateOfBirth,
        fatherName: draft.fatherName.trim(),
        motherName: draft.motherName.trim(),
        address: draft.address.trim(),
        attendance: Number.parseInt(draft.attendance, 10) || 0,
        conduct: draft.conduct.trim() || 'Good',
      },
      editingStudent ? 'edit' : 'add',
    );

    closeEditor();
  };

  return (
    <div className="space-y-4">
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

        <div className="sm:ml-auto flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" placeholder="Search name, roll, gender, caste…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 rounded-xl text-sm w-full sm:w-56 outline-none transition-all"
              style={{ background:'rgba(255,255,255,0.8)', border:'1.5px solid #e2e8f0' }}
            />
          </div>

          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
          >
            + Add Student
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(199,210,254,0.5)', boxShadow:'0 2px 12px rgba(79,70,229,0.06)' }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {['#', 'Name', 'Roll', 'Grade', 'Gender', 'Caste', '%', 'Attend.', 'Actions'].map(h => (
                <th key={h} className="py-3.5 px-4 text-left text-xs font-bold text-white/80 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-slate-300 text-sm">No students found</td></tr>
            ) : rows.map((s, i) => {
              const gp = GP_STYLE[s.gradePoint] ?? { bg:'rgba(148,163,184,0.12)', color:'#475569' };
              return (
                <tr key={s.id} className="table-row transition-colors"
                  style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(248,250,252,0.8)' }}>
                  <td className="py-3 px-4 text-slate-400 text-xs tabular-nums">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums">{s.rollno}</td>
                  <td className="py-3 px-4">
                    <span className="badge" style={{ background:'rgba(79,70,229,0.08)', color:'#4338ca' }}>Gr {s.grade}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{s.gender || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{s.caste || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="badge font-bold" style={{ background: gp.bg, color: gp.color }}>{s.percentage}%</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 tabular-nums">{s.attendance}%</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background:'rgba(79,70,229,0.1)', color:'#4f46e5' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteStudent(s.id)}
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background:'rgba(239,68,68,0.1)', color:'#b91c1c' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[
            { label:'← Prev', action:() => setPage(p => Math.max(1,p - 1)), disabled: page === 1 },
            { label:'Next →', action:() => setPage(p => Math.min(pages,p + 1)), disabled: page === pages },
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

      {isEditorOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-5 space-y-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{editingStudent ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={closeEditor} className="text-slate-400">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key:'name', label:'Name *' },
                { key:'rollno', label:'Roll No *' },
                { key:'grade', label:'Grade *' },
                { key:'gender', label:'Gender' },
                { key:'caste', label:'Caste' },
                { key:'dateOfBirth', label:'Date of Birth' },
                { key:'fatherName', label:'Father Name' },
                { key:'motherName', label:'Mother Name' },
                { key:'attendance', label:'Attendance %' },
                { key:'conduct', label:'Conduct' },
              ].map(field => (
                <label key={field.key} className="text-xs text-slate-600">
                  {field.label}
                  <input
                    type={field.key === 'dateOfBirth' ? 'date' : field.key === 'attendance' ? 'number' : 'text'}
                    value={draft[field.key as keyof StudentDraft]}
                    onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </label>
              ))}
              <label className="text-xs text-slate-600 md:col-span-3">
                Address
                <textarea
                  value={draft.address}
                  onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  rows={2}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeEditor} className="px-4 py-2 rounded-lg text-sm" style={{ background:'#f1f5f9' }}>
                Cancel
              </button>
              <button onClick={saveStudent} className="px-4 py-2 rounded-lg text-sm text-white" style={{ background:'#4f46e5' }}>
                {editingStudent ? 'Update' : 'Add'} Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Student } from '@/types';
import { formatDate, subjectLabel } from '@/lib/utils';

type SchoolMeta = {
  name: string;
  address: string;
  phone: string;
  email: string;
  academicYear: string;
  evaluationPeriod: string;
};

type BaseTemplateProps = {
  student: Student;
  remarks: string;
  school: SchoolMeta;
};

const PageShell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-8" style={{ fontFamily: "'Noto Sans Gujarati', 'Inter', sans-serif" }}>
    <header className="border-2 border-indigo-700 rounded-lg p-4">
      <h1 className="text-center text-2xl font-bold text-indigo-800">{title}</h1>
      {subtitle ? <p className="text-center text-sm text-slate-600 mt-1">{subtitle}</p> : null}
    </header>
    <div className="mt-4">{children}</div>
  </div>
);

const StudentInfoTable: React.FC<{ student: Student }> = ({ student }) => (
  <table className="w-full border border-slate-300 text-sm">
    <tbody>
      {[
        ['Name', student.nameGujarati || student.name],
        ['Roll No', student.rollno],
        ['Grade', student.grade],
        ['Date of Birth', formatDate(student.dateOfBirth)],
        ["Father's Name", student.fatherNameGujarati || student.fatherName],
        ["Mother's Name", student.motherNameGujarati || student.motherName],
        ['Address', student.addressGujarati || student.address],
      ].map(([label, value]) => (
        <tr key={label}>
          <td className="border border-slate-300 bg-slate-50 font-semibold px-3 py-2 w-1/3">{label}</td>
          <td className="border border-slate-300 px-3 py-2">{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const MarksheetTemplate: React.FC<BaseTemplateProps> = ({ student, remarks, school }) => {
  const subjects = Object.entries(student.marks);
  return (
    <PageShell title="Marksheet" subtitle={`Academic Year: ${school.academicYear}`}>
      <StudentInfoTable student={student} />

      <h2 className="text-lg font-bold mt-6 mb-2 text-indigo-800">Subject-wise Marks</h2>
      <table className="w-full border border-slate-300 text-sm">
        <thead>
          <tr className="bg-indigo-700 text-white">
            <th className="border border-indigo-800 px-3 py-2 text-left">Subject</th>
            <th className="border border-indigo-800 px-3 py-2 text-right">Marks Obtained</th>
            <th className="border border-indigo-800 px-3 py-2 text-right">Maximum Marks</th>
            <th className="border border-indigo-800 px-3 py-2 text-right">Grade Point</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(([subject, mark]) => (
            <tr key={subject}>
              <td className="border border-slate-300 px-3 py-2">{subjectLabel(subject)}</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{mark}</td>
              <td className="border border-slate-300 px-3 py-2 text-right">100</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{student.gradePoint}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
        <div className="border border-slate-300 rounded p-3"><span className="font-semibold">Percentage:</span> {student.percentage}%</div>
        <div className="border border-slate-300 rounded p-3"><span className="font-semibold">Attendance:</span> {student.attendance}%</div>
      </div>

      <section className="mt-6 border border-slate-300 rounded p-3">
        <h3 className="font-semibold mb-2">Teacher Remarks</h3>
        <p className="text-sm whitespace-pre-wrap break-words">{remarks}</p>
      </section>
    </PageShell>
  );
};

export const LeavingCertTemplate: React.FC<BaseTemplateProps> = ({ student, remarks, school }) => (
  <PageShell title="Leaving Certificate" subtitle={`${school.name} • Academic Year: ${school.academicYear}`}>
    <p className="text-sm text-slate-700 mb-3">Certificate Date: {new Date().toLocaleDateString('en-IN')}</p>
    <StudentInfoTable student={student} />
    <section className="mt-6 border border-slate-300 rounded p-3">
      <h3 className="font-semibold mb-2">Character Certificate</h3>
      <p className="text-sm whitespace-pre-wrap break-words">{remarks}</p>
    </section>
  </PageShell>
);

export const PeriodicEvalTemplate: React.FC<BaseTemplateProps> = ({ student, remarks, school }) => (
  <PageShell title="Periodic Evaluation Report" subtitle={`${school.evaluationPeriod} • ${school.academicYear}`}>
    <StudentInfoTable student={student} />
    <h2 className="text-lg font-bold mt-6 mb-2 text-indigo-800">Evaluation Summary</h2>
    <table className="w-full border border-slate-300 text-sm">
      <thead>
        <tr className="bg-indigo-700 text-white">
          <th className="border border-indigo-800 px-3 py-2 text-left">Subject</th>
          <th className="border border-indigo-800 px-3 py-2 text-right">Marks</th>
          <th className="border border-indigo-800 px-3 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(student.marks).map(([subject, mark]) => (
          <tr key={subject}>
            <td className="border border-slate-300 px-3 py-2">{subjectLabel(subject)}</td>
            <td className="border border-slate-300 px-3 py-2 text-right">{mark}</td>
            <td className="border border-slate-300 px-3 py-2 text-right">100</td>
          </tr>
        ))}
      </tbody>
    </table>

    <section className="mt-6 border border-slate-300 rounded p-3">
      <h3 className="font-semibold mb-2">Detailed Evaluation</h3>
      <p className="text-sm whitespace-pre-wrap break-words">{remarks}</p>
    </section>
  </PageShell>
);

type AttendanceTemplateProps = {
  students: Student[];
  attendanceData: Map<string, { month: number; year: number; days: boolean[] }>;
  grade: string;
  school: SchoolMeta;
};

export const AttendanceTemplate: React.FC<AttendanceTemplateProps> = ({ students, attendanceData, grade, school }) => {
  const first = students[0];
  const sample = first ? attendanceData.get(first.id) : undefined;
  const daysInMonth = sample?.days.length ?? 30;

  return (
    <PageShell
      title="Attendance Register"
      subtitle={`${school.name} • Grade ${grade} • ${(sample?.month ?? 0) + 1}/${sample?.year ?? new Date().getFullYear()}`}
    >
      <div className="overflow-hidden border border-slate-300 rounded">
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-indigo-700 text-white">
              <th className="border border-indigo-800 px-1 py-1">અનુક્રમ નંબર</th>
              <th className="border border-indigo-800 px-2 py-1 text-left">વિદ્યાર્થીનું નામ</th>
              <th className="border border-indigo-800 px-2 py-1 text-left">જન્મ તારીખ</th>
              <th className="border border-indigo-800 px-2 py-1 text-left">જ.રજીસ્ટર નંબર</th>
              <th className="border border-indigo-800 px-2 py-1 text-left">જાતિ</th>
              <th className="border border-indigo-800 px-2 py-1 text-left">ધોરણમાં દાખલ તારીખ</th>
              {Array.from({ length: daysInMonth }, (_, idx) => (
                <th key={idx} className="border border-indigo-800 px-1 py-1">{idx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="border border-slate-300 px-1 py-1 text-center">{index + 1}</td>
                <td className="border border-slate-300 px-2 py-1">{student.nameGujarati || student.name}</td>
                <td className="border border-slate-300 px-2 py-1">{formatDate(student.dateOfBirth)}</td>
                <td className="border border-slate-300 px-2 py-1">{student.rollno}</td>
                <td className="border border-slate-300 px-2 py-1">{student.caste}</td>
                <td className="border border-slate-300 px-2 py-1"></td>
                {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                  const info = attendanceData.get(student.id);
                  const present = info?.days[dayIndex];
                  return (
                    <td key={dayIndex} className="border border-slate-300 px-1 py-1 text-center">{present ? 'P' : ''}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
};

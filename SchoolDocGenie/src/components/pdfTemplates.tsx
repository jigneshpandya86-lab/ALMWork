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
  const daysInMonth = sample?.days.length ?? 31;
  const month = sample?.month ?? new Date().getMonth();
  const year = sample?.year ?? new Date().getFullYear();
  const monthDisplay = `${new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' })} - ${year}`;
  const academicYear = month <= 4
    ? `${year - 1}-${String(year).slice(-2)}`
    : `${year}-${String(year + 1).slice(-2)}`;

  const weekdayLabels = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'] as const;

  const leftDays = Array.from({ length: Math.min(daysInMonth, 19) }, (_, idx) => idx + 1);
  const rightDays = Array.from({ length: Math.max(daysInMonth - 19, 0) }, (_, idx) => idx + 20);
  const summaryColumns = [
    'હાજર',
    'ગેરહાજર',
    'રજા',
    'રોગચાળો',
    'કુલ',
    'માસના ગેરહાજર',
    'રજા',
    'ગયા માસ સુધી એકંદર ગેરહાજર',
    'સળંગ ત્રણ દિવસ ગેરહાજર',
  ];
  const verticalHeaderStyle: React.CSSProperties = {
    display: 'inline-block',
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 1.05,
  };

  const renderDayHeader = (day: number) => {
    const weekdayIndex = new Date(year, month, day).getDay();
    const weekday = weekdayLabels[weekdayIndex];
    const isSunday = weekdayIndex === 0;
    return (
      <th key={`day-${day}`} className={`border border-slate-700 px-0 py-0 align-bottom w-[30px] min-w-[30px] ${isSunday ? 'bg-slate-200' : ''}`}>
        <div className="h-[126px] flex items-center justify-center">
          <div style={verticalHeaderStyle} className="text-center">
            <div className="font-semibold">{weekday}</div>
            <div>તા. {String(day).padStart(2, '0')}</div>
          </div>
        </div>
      </th>
    );
  };

  const renderGridRow = (
    student: Student,
    index: number,
    dayRange: number[],
    includeStudentInfo: boolean,
    includeSummary: boolean
  ) => {
    const info = attendanceData.get(student.id);
    return (
      <tr key={`${student.id}-${includeStudentInfo ? 'left' : 'right'}`}>
        {includeStudentInfo ? (
          <>
            <td className="border border-slate-700 px-1 py-1 text-center">{index + 1}</td>
            <td className="border border-slate-700 px-2 py-1 whitespace-nowrap text-[9px]">{student.nameGujarati || student.name}</td>
            <td className="border border-slate-700 px-2 py-1 text-center">{formatDate(student.dateOfBirth)}</td>
            <td className="border border-slate-700 px-2 py-1 text-center">{student.rollno}</td>
            <td className="border border-slate-700 px-2 py-1 text-center">{student.caste}</td>
            <td className="border border-slate-700 px-2 py-1"></td>
          </>
        ) : null}
        {dayRange.map((day) => {
          const dayIndex = new Date(year, month, day).getDay();
          const isSunday = dayIndex === 0;
          const present = info?.days[day - 1];
          return (
            <td key={`${student.id}-${day}`} className={`border border-slate-700 px-1 py-1 text-center ${isSunday ? 'bg-slate-200' : ''}`}>
              {!isSunday && present ? 'P' : ''}
            </td>
          );
        })}
        {includeSummary
          ? summaryColumns.map((column) => (
              <td key={`${student.id}-${column}`} className="border border-slate-700 px-1 py-1 text-center"></td>
            ))
          : null}
      </tr>
    );
  };

  const renderRegisterHeader = () => (
    <div className="border-b border-slate-700">
      <div className="grid grid-cols-[1.3fr_1.3fr_1.7fr_1fr] text-[16px] leading-tight">
        <div className="px-2 py-2">જીલ્લા શિક્ષણ સમિતિ વડોદરા&nbsp;&nbsp;{academicYear}</div>
        <div className="px-2 py-2 text-center">ધનતેજ પ્રાથમિક શાળા તા.સાવલી</div>
        <div className="px-2 py-2 text-center">વડોદરાનું વિદ્યાર્થીઓનું હાજરી પત્રક (કેટલોગ)</div>
        <div className="px-2 py-2 text-center">માહે : {monthDisplay}</div>
      </div>
      <div className="grid grid-cols-2 text-[16px] leading-tight">
        <div className="px-2 py-1 text-center">દરરોજનું હાજરી પત્રક</div>
        <div className="px-2 py-1 text-center">ધોરણ : {grade}</div>
      </div>
    </div>
  );

  return (
    <div className="w-[1123px] bg-white text-slate-900" style={{ fontFamily: "'Noto Sans Gujarati', 'Inter', sans-serif" }}>
      <section className="w-[1123px] min-h-[794px] p-4" style={{ pageBreakAfter: 'always' }}>
        <div className="border-2 border-blue-700">
          {renderRegisterHeader()}
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr>
                <th className="border border-slate-700 px-1 py-1">
                  <div style={verticalHeaderStyle}>અનુક્રમ નંબર</div>
                </th>
                <th className="border border-slate-700 px-2 py-1 whitespace-nowrap">વિદ્યાર્થીનું નામ</th>
                <th className="border border-slate-700 px-2 py-1">
                  <div style={verticalHeaderStyle}>જન્મ તારીખ</div>
                </th>
                <th className="border border-slate-700 px-2 py-1">
                  <div style={verticalHeaderStyle}>જ.રજીસ્ટર નંબર</div>
                </th>
                <th className="border border-slate-700 px-2 py-1">
                  <div style={verticalHeaderStyle}>જાતિ</div>
                </th>
                <th className="border border-slate-700 px-2 py-1">
                  <div style={verticalHeaderStyle}>ધોરણમાં દાખલ તારીખ</div>
                </th>
                {leftDays.map(renderDayHeader)}
              </tr>
              <tr className="bg-orange-50">
                {Array.from({ length: 6 + leftDays.length }, (_, i) => (
                  <th key={`idx-left-${i}`} className="border border-slate-700 px-1 py-0.5 font-normal">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => renderGridRow(student, index, leftDays, true, false))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="w-[1123px] min-h-[794px] p-4">
        <div className="border-2 border-blue-700">
          {renderRegisterHeader()}
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr>
                {rightDays.map(renderDayHeader)}
                {summaryColumns.map((column, idx) => (
                  <th key={`${column}-${idx}`} className="border border-slate-700 px-0 py-0 w-[34px] min-w-[34px]">
                    <div className="h-[126px] flex items-center justify-center">
                      <div style={verticalHeaderStyle}>{column}</div>
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="bg-orange-50">
                {Array.from({ length: rightDays.length + summaryColumns.length }, (_, i) => (
                  <th key={`idx-right-${i}`} className="border border-slate-700 px-1 py-0.5 font-normal">{i + 26}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => renderGridRow(student, index, rightDays, false, true))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

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



type PaSheetTemplateProps = {
  subject: 'ગણિત' | 'વિજ્ઞાન';
  standard: '૬' | '૭' | '૮';
};

export const PASheetTemplate: React.FC<PaSheetTemplateProps> = ({ subject, standard }) => {
  const row1 = ['ધનતેજ પ્રાથમિક શાળા             તા. સાવલી                      ૫ત્રક : A', ...Array(19).fill(''), 'સને :', '', '', '2025-26', '', ''];
  const row2 = [`રચાનાત્મક મુલ્યાંક્ન પત્રક                        વિષય- ${subject}               ધોરણ -${standard}         (પ્રથમ સત્ર)             `, ...Array(25).fill('')];
  const row3 = ['અ.નં.', 'વિધાર્થીનું નામ', 'સંખ્યા પરિચય', '', '', '', 'પૂર્ણ સંખ્યાઓ', '', '', '', 'સંખ્યા સાથે રમત અને ભૂમિતિના પાયાના ખ્યાલો', '', '', '', 'પાયાના આકારોની સમજૂતિ', '', '', '', 'પૂર્ણાંક સંખ્યાઓ', '', '', '', 'સત્રાંતે વિદ્યાર્થીઓએ મેળવેલ જેતે નિશાનીઓની કુલ સંખ્યા ', '', '', '૪૦ માંથી મેળવેલ ગુણ'];
  const row4 = [
    '', '',
    'યોગ્ય પ્રક્રિયાના ( ભા.ગુ.સ.બા.) ઉપયોગ દ્વારા મોટી સંખ્યાના દાખલા ઉકેલે છે.',
    'આપેલ અંકો પરથી સંખ્યા બનાવે છે ',
    '100000  સુધીની સંખ્યાઓ સમજે છે  તેમજ અંકોમાં અને સબ્દોમાં લખે છે',
    'આસન્ન મુલ્ય દ્વારા નજીકના દસકનો સોનો હજારનો અંદાજ કાઢે છે',
    'પૂર્ણ સંખ્યા સાથે કામ કરે છે.',
    'આપેલ પૂર્ણસંખ્યાની પહેલાની સંખ્યા અને પછીની સંખ્યા લખે છે',
    'સંખ્યારેખા પર સંખ્યાનું નિરૂપણ તેમજ  સંખ્યાઓના સરવાળા , બાદબાકી અને ગુણાકાર કરે છે',
    'પૂર્ણ સંખ્યા વિશેના સરવાળા અને ગુણાકાર ના ગુણધર્મો જણાવે છે તેમજ ગુણધર્મ નો ઉપયોગ કરી ગણતરી કરે છે ',
    'પેટર્ન દ્વારા એકી, બેકી, વિભાજ્ય, અવિભાજ્ય અને સહ અવિભાજ્ય સંખ્યાઓને ઓળખે છે.',
    'આપેલ સંખ્યા અવિભાજ્ય છે કે વિભાજ્ય તે કહે છે.',
    '2,3,4,5,6,8,9,10 અને  11 ની વિભાજ્યતાની ચાવી નો ઉપયોગ કરી  વિભાજ્યતા ચકાસે છે ',
    'વિભાજ્યતાના નિયમનો ઉપયોગ કરે છે',
    'ત્રિકોણને તેના ખુણા/બાજુઓના આધારે વિવિધ જૂથ/પ્રકારોમાં વર્ગીકૃત કરે છે.',
    'બાજુઓના માપના આધારે ત્રિકોણ ના પ્રકાર જણાવે છે',
    'ખૂણાઓના માપના આધારે ત્રિકોણ ના પ્રકાર જણાવે છે',
    'ચતુષ્કોણને તેના ખુણા/બાજુઓના આધારે વિવિધ જૂથ/પ્રકારોમાં વહેંચે છે ',
    'પૂર્ણાંક સંખ્યાઓને લગતા સરવાળા બાદબાકીના દાખલા ગણે છે. ',
    'પૂર્ણાંક સંખ્યાઓ વિશે જણાવે છે.',
    'સંખ્યારેખાની મદદથી પૂર્ણાંક સંખ્યાઓના સરવાળા કરે છે.',
    'સંખ્યારેખાની મદદથી પૂર્ણાંક સંખ્યાઓના સરવાળા કરે છે.',
    '', '', '', ''
  ];
  const rows = [row1, row2, row3, row4];

  return (
    <div className="w-[1123px] min-h-[794px] bg-white p-4" style={{ fontFamily: "'Noto Sans Gujarati', sans-serif" }}>
      <table className="w-full border-collapse text-[10px] table-fixed">
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td
                  key={`${ri}-${ci}`}
                  className={`border border-slate-400 px-1 ${ri < 2 ? 'text-left align-middle' : 'text-center align-top'} ${ri === 3 ? 'whitespace-normal break-words h-28' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
    'તહેવાર',
    'રવિવાર',
    'કુલ',
    'ચાલુ માસના હાજર દિવસ',
    'વા.પરીક્ષા પછી ગયા માસ સુધીના હાજર દિવસ',
    'ચાલુ માસ સાથે પરીક્ષા પછીના હાજર દિવસ',
  ];
  const summaryColumnWidths = ['4%', '4%', '4%', '4%', '4%', '4%', '9%', '9.5%', '9.5%'];
  const studentRowHeightPx = 21;
  const verticalHeaderStyle: React.CSSProperties = {
    display: 'inline-block',
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
    whiteSpace: 'nowrap',
    lineHeight: 1.05,
  };

  const renderDayHeader = (day: number, widthStyle: React.CSSProperties) => {
    const weekdayIndex = new Date(year, month, day).getDay();
    const weekday = weekdayLabels[weekdayIndex];
    const isSunday = weekdayIndex === 0;
    return (
      <th
        key={`day-${day}`}
        style={widthStyle}
        className={`border border-slate-700 px-0 py-0 align-bottom ${isSunday ? 'bg-slate-200' : ''}`}
      >
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
      <tr
        key={`${student.id}-${includeStudentInfo ? 'left' : 'right'}`}
        style={{ height: `${studentRowHeightPx}px`, minHeight: `${studentRowHeightPx}px`, maxHeight: `${studentRowHeightPx}px` }}
      >
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
      <section data-pdf-page="true" className="w-[1123px] h-[794px] p-4 overflow-hidden">
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
                {leftDays.map((day) => renderDayHeader(day, { width: '30px', minWidth: '30px' }))}
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

      <section data-pdf-page="true" className="w-[1123px] h-[794px] p-4 overflow-hidden">
        <div className="border-2 border-blue-700">
          {renderRegisterHeader()}
          <table className="w-full border-collapse table-fixed text-[10px]">
            <thead>
              <tr>
                {rightDays.map((day) => renderDayHeader(day, { width: '4%', minWidth: '4%' }))}
                {summaryColumns.map((column, idx) => (
                  <th
                    key={`${column}-${idx}`}
                    style={{ width: summaryColumnWidths[idx], minWidth: summaryColumnWidths[idx] }}
                    className="border border-slate-700 px-0 py-0"
                  >
                    <div className="h-[126px] flex items-center justify-center">
                      <div style={verticalHeaderStyle}>
                        {idx >= summaryColumns.length - 2 ? (
                          <>
                            {column.split(' ').slice(0, Math.ceil(column.split(' ').length / 2)).join(' ')}
                            <br />
                            {column.split(' ').slice(Math.ceil(column.split(' ').length / 2)).join(' ')}
                          </>
                        ) : (
                          column
                        )}
                      </div>
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

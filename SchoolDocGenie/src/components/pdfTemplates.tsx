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
  students: Student[];
  subject: 'ગણિત' | 'વિજ્ઞાન';
  standard: '૬' | '૭' | '૮';
};

export const PASheetTemplate: React.FC<PaSheetTemplateProps> = ({ students, subject, standard }) => {
  const TOTAL_COLUMNS = 26;
  const ROWS_PER_PAGE = 27;
  type MergedHeaderCell = {
    content: string;
    rowSpan?: number;
    colSpan?: number;
  };
  const mergedTableHeaders: MergedHeaderCell[][] = [
    [
      { content: 'અ.નં.', rowSpan: 3 },
      { content: 'વિદ્યાર્થીનું નામ', rowSpan: 3 },
      { content: 'સંખ્યા પરિચય', colSpan: 4 },
      { content: 'પૂર્ણ સંખ્યાઓ', colSpan: 4 },
      { content: 'સંખ્યા સાથે રમત અને ભૂમિતિના પાયાના ખ્યાલો', colSpan: 4 },
      { content: 'પાયાના આકારોની સમજૂતિ', colSpan: 4 },
      { content: 'પૂર્ણાંક સંખ્યાઓ', colSpan: 4 },
      { content: 'સત્રાંતે વિદ્યાર્થીઓએ મેળવેલ જેતે નિશાનીઓની કુલ સંખ્યા', colSpan: 3, rowSpan: 2 },
      { content: '૪૦ માંથી મેળવેલ ગુણ', rowSpan: 3 },
    ],
    [
      { content: 'યોગ્ય પ્રક્રિયાના ( ભા.ગુ.સ.બા.) ઉપયોગ દ્વારા મોટી સંખ્યાના દાખલા ઉકેલે છે.' },
      { content: 'આપેલ અંકો પરથી સંખ્યા બનાવે છે' },
      { content: '100000 સુધીની સંખ્યાઓ સમજે છે તેમજ અંકોમાં અને સબ્દોમાં લખે છે' },
      { content: 'આસન્ન મુલ્ય દ્વારા નજીકના દસકનો સોનો હજારનો અંદાજ કાઢે છે' },
      { content: 'પૂર્ણ સંખ્યા સાથે કામ કરે છે.' },
      { content: 'આપેલ પૂર્ણસંખ્યાની પહેલાની સંખ્યા અને પછીની સંખ્યા લખે છે' },
      { content: 'સંખ્યારેખા પર સંખ્યાનું નિરૂપણ તેમજ સંખ્યાઓના સરવાળા, બાદબાકી અને ગુણાકાર કરે છે' },
      { content: 'પૂર્ણ સંખ્યા વિશેના સરવાળા અને ગુણાકાર ના ગુણધર્મો જણાવે છે તેમજ ગુણધર્મ નો ઉપયોગ કરી ગણતરી કરે છે' },
      { content: 'પેટર્ન દ્વારા એકી, બેકી, વિભાજ્ય, અવિભાજ્ય અને સહ અવિભાજ્ય સંખ્યાઓને ઓળખે છે.' },
      { content: 'આપેલ સંખ્યા અવિભાજ્ય છે કે વિભાજ્ય તે કહે છે.' },
      { content: '2,3,4,5,6,8,9,10 અને 11 ની વિભાજ્યતાની ચાવી નો ઉપયોગ કરી વિભાજ્યતા ચકાસે છે' },
      { content: 'વિભાજ્યતાના નિયમનો ઉપયોગ કરે છે' },
      { content: 'ત્રિકોણને તેના ખુણા/બાજુઓના આધારે વિવિધ જૂથ/પ્રકારોમાં વર્ગીકૃત કરે છે.' },
      { content: 'બાજુઓના માપના આધારે ત્રિકોણ ના પ્રકાર જણાવે છે' },
      { content: 'ખૂણાઓના માપના આધારે ત્રિકોણ ના પ્રકાર જણાવે છે' },
      { content: 'ચતુષ્કોણને તેના ખુણા/બાજુઓના આધારે વિવિધ જૂથ/પ્રકારોમાં વહેંચે છે' },
      { content: 'પૂર્ણાંક સંખ્યાઓને લગતા સરવાળા બાદબાકીના દાખલા ગણે છે.' },
      { content: 'પૂર્ણાંક સંખ્યાઓ વિશે જણાવે છે.' },
      { content: 'સંખ્યારેખાની મદદથી પૂર્ણાંક સંખ્યાઓના સરવાળા કરે છે.' },
      { content: 'સંખ્યારેખાની મદદથી પૂર્ણાંક સંખ્યાઓના સરવાળા કરે છે.' },
    ],
    [
      ...Array.from({ length: 20 }, (_, i) => ({ content: String(i + 1) })),
      { content: '√' }, { content: '?' }, { content: '×' },
    ],
  ];
  const grade7MathsHeader: MergedHeaderCell[][] = [
    [
      { content: 'અ.નં.', rowSpan: 3 },
      { content: 'વિદ્યાર્થીનું નામ', rowSpan: 3 },
      { content: 'પૂર્ણાંક સંખ્યાઓ', colSpan: 2 },
      { content: 'અપૂર્ણાંક/દશાંશ સંખ્યાઓ', colSpan: 3 },
      { content: 'માહિતીનું નિયમન', colSpan: 6 },
      { content: 'સાદા સમીકરણ', colSpan: 3 },
      { content: 'રેખા અને ખૂણા', colSpan: 3 },
      { content: 'ત્રિકોણ અને તેના ગુણધર્મો', colSpan: 3 },
      { content: 'સત્રાંતે વિદ્યાર્થીઓએ મેળવેલ જેતે નિશાનીઓની કુલ સંખ્યા', colSpan: 3, rowSpan: 2 },
      { content: '૪૦ માંથી મેળવેલ ગુણ', rowSpan: 3 },
    ],
    [
      { content: 'પૂર્ણાંક સંખ્યાઓની સરવાળા તથા બાદબાકી વિશેના ગુણધર્મોનું સામાન્યીકરણ કરે છે.' },
      { content: 'પૂર્ણાંક સંખ્યાઓના ગુણાકાર કરે છે. તથા તેને લગતા વ્યવહારુ કોયડાઓ ઉકેલે છે' },
      { content: 'અપૂર્ણાંક સંખ્યાઓનો પૂર્ણ સંખ્યા સાથે ગુણાકાર કરે છે.' },
      { content: 'દશાંશ સંખ્યા ના 10, 100,1000 વડે ગુણાકાર કરે છે' },
      { content: 'દશાંશ સંખ્યા ના 10, 100,1000 વડે ભાગાકાર કરે છે' },
      { content: 'આપેલ માહિતી નો વિસ્તાર શોધે છે' },
      { content: 'આપેલ માહિતી પરથી સરાસરી શોધે છે' },
      { content: 'આપેલ માહિતી પરથી બહુલક શોધે છે' },
      { content: 'આપેલ માહિતી પરથી મધ્યસ્થ શોધે છે' },
      { content: 'બનતી ઘટનાની સંભાવના કહે છે' },
      { content: 'માહિતી પરથી લંબ આલેખ અને દ્વિલંબ આલેખનું અર્થઘટન કરે છે.' },
      { content: 'વિધાનોને સમીકરણ સ્વરૂપમાં લખે છે.' },
      { content: 'આપેલ સમીકરણનો ઉકેલ શોધે છે' },
      { content: 'સમીકરણ ના ઉકેલ પરથી સમીકરણ ની રચના કરે છે' },
      { content: 'આપેલ આકૃતિમાં વિવિધ ખૂણાઓની જોડને ઓળખે છે.' },
      { content: 'આપેલ આકૃતિમાં વિવિધ ખૂણાઓની જોડ લખે છે.' },
      { content: 'બે સમાંતર રેખાઓની છેદિકાથી બનતા ખૂણાઓ ની જોડ ઓળખે છે તેમજ એક ખૂણાના માપ પરથી અન્ય ખૂણા ના માપ શોધે છે' },
      { content: 'ત્રિકોણની મધ્યગા અને વેધની સમજ કેળવે છે.' },
      { content: 'ત્રિકોણના બહિષ્કોણના ગુણધર્મની મદદથી ખૂણાના માપ શોધે છે.' },
      { content: 'વિશિષ્ટ ત્રિકોણ જેવા કે સમબાજુ અને સમદ્વિબાજુની સમજ કેળવે છે' },
    ],
    [
      ...Array.from({ length: 20 }, (_, i) => ({ content: String(i + 1) })),
      { content: '√' }, { content: '?' }, { content: '×' },
    ],
  ];
  const grade7ScienceHeader: MergedHeaderCell[][] = [
    [
      { content: 'અ.નં.', rowSpan: 3 },
      { content: 'વિદ્યાર્થીનું નામ', rowSpan: 3 },
      { content: 'વનસ્પતિમાં પોષણ', colSpan: 3 },
      { content: 'પ્રાણીઓમાં પોષણ', colSpan: 3 },
      { content: 'ઉષ્મા', colSpan: 4 },
      { content: 'એસિડ, બેઈઝ, ક્ષાર', colSpan: 4 },
      { content: 'ભૌતિક અને રાસાયણિક ફેરફારો', colSpan: 3 },
      { content: 'સજીવોમાં શ્વસન', colSpan: 3 },
      { content: 'સત્રાંતે વિદ્યાર્થીઓએ મેળવેલ જેતે નિશાનીઓની કુલ સંખ્યા', colSpan: 3, rowSpan: 2 },
      { content: '૪૦ માંથી મેળવેલ ગુણ', rowSpan: 3 },
    ],
    [
      { content: 'પદાર્થો અને સજીવોને તેમના ગુણધર્મો / લાક્ષણિકતાના આધારે વર્ગીકૃત કરે છે.' },
      { content: 'પ્રશ્નોના જવાબ મેળવવા માટે સરળ તપાસ હાથ ધરે છે.' },
      { content: 'પ્રક્રિયા અને સજીવોની નામનિર્દેશન વાળી આકૃતિ / ફ્લોચાર્ટ દોરે છે.' },
      { content: 'પદાર્થ અને સજીવોના દેખાવ, રચના, કાર્ય વગેરે જેવાં લક્ષણોના આધારે ઓળખે છે.' },
      { content: 'વૈજ્ઞાનિક શોધ, વાર્તાઓની ચર્ચા અને કદર કરે છે.' },
      { content: 'શીખેલા વૈજ્ઞાનિક ખ્યાલોને રોજિંદા જીવનમાં લાગુ કરે છે.' },
      { content: 'પદાર્થ અને સજીવોને તેમના ગુણધર્મો રચના અને કાર્યના આધારે જુદા પાડે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાઓને કારણો સાથે જોડે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાઓને સમજાવે છે.' },
      { content: 'માપન અને ગણન કરે છે.' },
      { content: 'પદાર્થ અને સજીવોને તેમના ગુણધર્મો રચના અને કાર્યના આધારે જુદા પાડે છે.' },
      { content: 'પ્રશ્નોના જવાબ મેળવવા માટે સરળ તપાસ હાથ ધરે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાઓને કારણો સાથે જોડે છે.' },
      { content: 'રાસાયણિક પ્રક્રિયા માટેના શબ્દ સમીકરણ લખે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાઓને સમજાવે છે.' },
      { content: 'રાસાયણિક પ્રક્રિયા માટેના શબ્દ સમીકરણ લખે છે.' },
      { content: 'શીખેલા વૈજ્ઞાનિક ખ્યાલોને રોજિંદા જીવનમાં લાગુ કરે છે.' },
      { content: 'પદાર્થ અને સજીવોને તેમના ગુણધર્મો રચના અને કાર્યના આધારે જુદા પાડે છે.' },
      { content: 'પોતાની આસપાસમાંથી મળી આવતી વસ્તુની કાર્યપદ્ધતિ વર્ણવે છે.' },
      { content: 'શીખેલા વૈજ્ઞાનિક ખ્યાલોને રોજિંદા જીવનમાં લાગુ કરે છે.' },
    ],
    [
      ...Array.from({ length: 20 }, (_, i) => ({ content: String(i + 1) })),
      { content: '√' }, { content: '?' }, { content: '×' },
    ],
  ];
  const grade8MathsHeader: MergedHeaderCell[][] = [
    [
      { content: 'અ.નં.', rowSpan: 3 },
      { content: 'વિદ્યાર્થીનું નામ', rowSpan: 3 },
      { content: 'સંમેય સંખ્યાઓ', colSpan: 3 },
      { content: 'એક ચલ સુરેખ સમીકરણ', colSpan: 3 },
      { content: 'ચતુષ્કોણની સમજ', colSpan: 3 },
      { content: 'માહિતીનું નિયમન', colSpan: 4 },
      { content: 'વર્ગ અને વર્ગમૂળ', colSpan: 4 },
      { content: 'ઘન અને ઘનમૂળ', colSpan: 3 },
      { content: 'સત્રાંતે વિદ્યાર્થીઓએ મેળવેલ જેતે નિશાનીઓની કુલ સંખ્યા', colSpan: 3, rowSpan: 2 },
      { content: '૪૦ માંથી મેળવેલ ગુણ', rowSpan: 3 },
    ],
    [
      { content: 'પેટર્ન / ઉદાહરણ દ્વારા સંમેય સંખ્યાઓના સ., બા., ગુ., ભાગાકાર વિશેના ગુણધર્મોનું સામાન્યીકરણ કરે છે.' },
      { content: 'આપેલ સંખ્યાઓની વચ્ચે આવેલ શક્ય એટલી સંમેય સંખ્યાઓ શોધે છે' },
      { content: 'સંમેય સંખ્યાનું સંખ્યારેખા પર નિરૂપણ કરે છે.' },
      { content: 'એક બાજુ સુરેખ પદાવલી અને બીજી બાજુ સંખ્યા હોય તેવા સમીકરણનો ઉકેલ મેળવે છે.' },
      { content: 'બંને બાજુ ચલ હોય તેવા સમીકરણનો ઉકેલ મેળવે છે' },
      { content: 'સમીકરણનો સરળ સ્વરૂપમાં રૂપાંતર કરી ઉકેલ મેળવે છે' },
      { content: 'બહુકોણને ઓળખે છે.' },
      { content: 'બહુકોણના વિકર્ણ ની સંખ્યા જણાવે છે' },
      { content: 'બહુકોણના ખૂણાના સરવાળા નો ગુણધર્મ નો ઉપયોગ કરે છે' },
      { content: 'આપેલ માહિતીના આધારે આવૃત્તિ વિતરણ કોષ્ટક તૈયાર કરે છે' },
      { content: 'આપેલ માહિતી પરથી આલેખ દોરે છે' },
      { content: 'આપેલ સ્તંભ આલેખ નું વાંચન કરી અર્થઘટન કરે છે' },
      { content: 'આપેલ માહિતી પરથી વર્તુળ આલેખ દોરે છે' },
      { content: 'વર્ગસંખ્યા અને તેની વિવિધ લાક્ષણિકતાઓ જણાવે છે.' },
      { content: 'અવિભાજ્ય અવયવીકરણ ની મદદથી વર્ગમૂળ શોધે છે' },
      { content: 'ભાગાકાર ની રીતે વર્ગમૂળ શોધે છે' },
      { content: 'સંખ્યાના વર્ગમૂળનું અનુમાન કરે છે.' },
      { content: 'ઘન સંખ્યા અને તેની વિવિધ લાક્ષણિકતાઓ જણાવે છે.' },
      { content: 'અવિભાજ્ય અવયવીકરણની મદદથી ઘનમૂળ શોધી શકે છે.' },
      { content: 'અનુમાન ની રીતે ઘનમૂળ શોધે છે' },
    ],
    [
      ...Array.from({ length: 20 }, (_, i) => ({ content: String(i + 1) })),
      { content: '√' }, { content: '?' }, { content: '×' },
    ],
  ];
  const grade8ScienceHeader: MergedHeaderCell[][] = [
    [
      { content: 'અ.નં.', rowSpan: 3 },
      { content: 'વિદ્યાર્થીનું નામ', rowSpan: 3 },
      { content: 'પાક ઉત્પાદન', colSpan: 4 },
      { content: 'સૂક્ષ્મજીવો : મિત્ર અને શત્રુ', colSpan: 4 },
      { content: 'કોલસો અને પેટ્રોલિયમ', colSpan: 3 },
      { content: 'દહન અને જ્યોત', colSpan: 3 },
      { content: 'વનસ્પતિઓ અને પ્રાણીઓનું સંરક્ષણ', colSpan: 3 },
      { content: 'પ્રાણીઓમાં પ્રજનન', colSpan: 3 },
      { content: 'સત્રાંતે વિદ્યાર્થીઓએ મેળવેલ જેતે નિશાનીઓની કુલ સંખ્યા', colSpan: 3, rowSpan: 2 },
      { content: '૪૦ માંથી મેળવેલ ગુણ', rowSpan: 3 },
    ],
    [
      { content: 'પદાર્થો અને સજીવોને ગુણધર્મો/લાક્ષણિકતાના આધારે વર્ગીકૃત કરે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાને કારણો સાથે જોડે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાઓને સમજાવે છે.' },
      { content: 'પર્યાવરણના રક્ષણ માટે પ્રયત્ન કરે છે.' },
      { content: 'પદાર્થ અને સજીવોને તેમનાં ગુણધર્મો રચના અને કાર્યના આધારે જુદા પાડે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાને કારણો સાથે જોડે છે.' },
      { content: 'પદાર્થો અને સજીવોને ગુણધર્મો/લાક્ષણિકતાના આધારે વર્ગીકૃત કરે છે.' },
      { content: 'પ્રશ્નોના જવાબ મેળવવા માટે સરળ તપાસ હાથ ધરે છે.' },
      { content: 'પ્રશ્નોના જવાબ મેળવવા માટે સરળ તપાસ હાથ ધરે છે.' },
      { content: 'શીખેલા વૈજ્ઞાનિક ખ્યાલોને રોજિંદા જીવનમાં લાગુ કરે છે.' },
      { content: 'વૈજ્ઞાનિક શોધ વાર્તાઓની ચર્ચા અને કદર કરે છે' },
      { content: 'પ્રશ્નોના જવાબ મેળવવા માટે સરળ તપાસ હાથ ધરે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાને કારણો સાથે જોડે છે.' },
      { content: 'પ્રક્રિયા અને સજીવોની નામનિર્દેશન વાળી આકૃતિ/ફ્લોચાર્ટ દોરે છે.' },
      { content: 'શીખેલા વૈજ્ઞાનિક ખ્યાલોને રોજિંદા જીવનમાં લાગુ કરે છે.' },
      { content: 'પર્યાવરણના રક્ષણ માટે પ્રયત્ન કરે છે.' },
      { content: 'રચના આયોજન અને પ્રાપ્ય સંસાધનોના ઉપયોગમાં સર્જનાત્મકતા પ્રદર્શિત કરે છે' },
      { content: 'પદાર્થો અને સજીવોને ગુણધર્મો/લાક્ષણિકતાના આધારે વર્ગીકૃત કરે છે.' },
      { content: 'પ્રક્રિયા અને ઘટનાઓને સમજાવે છે.' },
      { content: 'પ્રક્રિયા અને સજીવોની નામનિર્દેશન વાળી આકૃતિ/ફ્લોચાર્ટ દોરે છે.' },
    ],
    [
      ...Array.from({ length: 20 }, (_, i) => ({ content: String(i + 1) })),
      { content: '√' }, { content: '?' }, { content: '×' },
    ],
  ];
  const activeHeaders = standard === '૭' && subject === 'ગણિત'
    ? grade7MathsHeader
    : standard === '૭' && subject === 'વિજ્ઞાન'
      ? grade7ScienceHeader
      : standard === '૮' && subject === 'ગણિત'
        ? grade8MathsHeader
        : standard === '૮' && subject === 'વિજ્ઞાન'
          ? grade8ScienceHeader
      : mergedTableHeaders;

  const pages = students.length > 0
    ? Array.from({ length: Math.ceil(students.length / ROWS_PER_PAGE) }, (_, pageIndex) =>
        students.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE)
      )
    : [[]];

  return (
    <div className="w-[1520px] bg-white" style={{ fontFamily: "'Noto Sans Gujarati', sans-serif" }}>
      {pages.map((pageRows, pageIndex) => (
        <section key={`pa-page-${pageIndex}`} data-pdf-page="true" className="w-[1520px] min-h-[900px] px-4 pt-8 pb-8">
          <table className="w-full border-collapse text-[10px] table-fixed">
            <colgroup>
              <col style={{ width: '44px' }} />
              <col style={{ width: '260px' }} />
              {Array.from({ length: 20 }, (_, i) => (
                <col key={`pa-col-metric-${pageIndex}-${i}`} style={{ width: '48px' }} />
              ))}
              <col style={{ width: '44px' }} />
              <col style={{ width: '44px' }} />
              <col style={{ width: '44px' }} />
              <col style={{ width: '56px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="border border-slate-400 px-2 py-1 text-left" colSpan={TOTAL_COLUMNS}>
                  ધનતેજ પ્રાથમિક શાળા તા. સાવલી &nbsp;&nbsp;&nbsp; ૫ત્રક : A &nbsp;&nbsp;&nbsp; સને : 2025-26
                </th>
              </tr>
              <tr>
                <th className="border border-slate-400 px-2 py-1 text-left" colSpan={TOTAL_COLUMNS}>
                  રચાનાત્મક મુલ્યાંક્ન પત્રક &nbsp;&nbsp;&nbsp; વિષય- {subject} &nbsp;&nbsp;&nbsp; ધોરણ -{standard} &nbsp;&nbsp;&nbsp; (પ્રથમ સત્ર)
                </th>
              </tr>
              {activeHeaders.map((headerRow, rowIndex) => (
                <tr key={`pa-head-${pageIndex}-${rowIndex}`}>
                  {headerRow.map((cell, cellIndex) => (
                    <th
                      key={`pa-head-${pageIndex}-${rowIndex}-${cellIndex}`}
                      rowSpan={cell.rowSpan}
                      colSpan={cell.colSpan}
                      className={`border border-slate-400 px-1 text-center align-middle ${
                        rowIndex === 1 ? 'py-2 text-[9px] whitespace-normal break-words leading-tight min-w-[44px]' : 'py-1'
                      }`}
                    >
                      {cell.content}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {pageRows.map((student, rowIndex) => {
                const serialNumber = pageIndex * ROWS_PER_PAGE + rowIndex + 1;
                const marks = student.assessmentMarks ?? {};
                const allMarks = Array.from({ length: 20 }, (_, i) => marks[`block${i + 1}`] ?? '×');
                const totalChecks = allMarks.filter((mark) => mark === '✓').length;
                const totalCrosses = allMarks.length - totalChecks;
                const scoreOutOf40 = Math.round((totalChecks / allMarks.length) * 40);
                return (
                  <tr key={`${student.id}-${pageIndex}`}>
                    <td className="border border-slate-400 px-1 py-1 text-center">{serialNumber}</td>
                    <td className="border border-slate-400 px-4 py-1 text-left whitespace-nowrap">
                      {student.nameGujarati || student.name}
                    </td>
                    {allMarks.map((mark, i) => (
                      <td key={`${student.id}-score-${i}`} className="border border-slate-400 px-1 py-1 text-center">
                        {mark}
                      </td>
                    ))}
                    <td className="border border-slate-400 px-1 py-1 text-center">{totalChecks}</td>
                    <td className="border border-slate-400 px-1 py-1 text-center">0</td>
                    <td className="border border-slate-400 px-1 py-1 text-center">{totalCrosses}</td>
                    <td className="border border-slate-400 px-1 py-1 text-center">{scoreOutOf40}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
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

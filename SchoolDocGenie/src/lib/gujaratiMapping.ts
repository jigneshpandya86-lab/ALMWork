export const GUJARATI_TRANSLATIONS = {
  // Document Types
  'Marksheet': 'ગુણપત્રક',
  'Leaving Certificate': 'શાળા છોડ્યાનું પ્રમાણપત્ર',
  'Attendance Register': 'હાજરી પત્રક',
  'Periodic Evaluation Report': 'સામયિક મૂલ્યાંકન અહેવાલ',

  // Sections
  'STUDENT INFORMATION': 'વિદ્યાર્થીની માહિતી',
  'SUBJECT-WISE MARKS': 'વિષયવાર ગુણ',
  'PERFORMANCE SUMMARY': 'પરિણામ સારાંશ',
  'TEACHER\'S REMARKS': 'શિક્ષકની નોંધ',
  'STUDENT DETAILS': 'વિદ્યાર્થીની વિગતો',
  'CHARACTER CERTIFICATE': 'ચારિત્ર્ય પ્રમાણપત્ર',
  'MARKS SUMMARY': 'ગુણ સારાંશ',
  'DETAILED EVALUATION': 'વિગતવાર મૂલ્યાંકન',
  'MONTH CALENDAR': 'માસિક કેલેન્ડર',

  // Headers & Labels
  'Name': 'નામ',
  'Roll No': 'રોલ નંબર',
  'Date of Birth': 'જન્મ તારીખ',
  'Grade': 'ધોરણ',
  'Father\'s Name': 'પિતાનું નામ',
  'Mother\'s Name': 'માતાનું નામ',
  'Address': 'સરનામું',
  'Subject': 'વિષય',
  'Marks Obtained': 'મેળવેલ ગુણ',
  'Maximum Marks': 'કુલ ગુણ',
  'Percentage': 'ટકાવારી',
  'Grade Point': 'ગ્રેડ',
  'Attendance': 'હાજરી',
  'Conduct': 'વર્તણૂક',
  'Academic Year': 'શૈક્ષણિક વર્ષ',
  'Certificate No': 'પ્રમાણપત્ર નંબર',
  'Date': 'તારીખ',
  'Status': 'સ્થિતિ',
  'Total': 'કુલ',
  'Class Teacher': 'વર્ગ શિક્ષક',
  'Principal': 'આચાર્ય',
  'Parent\'s Signature': 'વાલીની સહી',
  'Subject Teacher': 'વિષય શિક્ષક',

  // Subjects
  'Hindi': 'હિન્દી',
  'English': 'અંગ્રેજી',
  'Mathematics': 'ગણિત',
  'Science': 'વિજ્ઞાન',
  'Social Studies': 'સામાજિક વિજ્ઞાન',
  'Gujarati': 'ગુજરાતી',
  'Sanskrit': 'સંસ્કૃત',
  'Computer': 'કમ્પ્યુટર',
  'PT': 'વ્યાયામ',

  // Months
  'January': 'જાન્યુઆરી',
  'February': 'ફેબ્રુઆરી',
  'March': 'માર્ચ',
  'April': 'એપ્રિલ',
  'May': 'મે',
  'June': 'જૂન',
  'July': 'જુલાઈ',
  'August': 'ઓગસ્ટ',
  'September': 'સપ્ટેમ્બર',
  'October': 'ઓક્ટોબર',
  'November': 'નવેમ્બર',
  'December': 'ડિસેમ્બર',

  // Other
  'Standard': 'ધોરણ',
  'Excellent': 'ઉત્તમ',
  'Good': 'સરસ',
  'Average': 'મધ્યમ',
  'Below Avg': 'સુધારાની જરૂર',
  'This is a computer-generated document.': 'આ કોમ્પ્યુટર દ્વારા જનરેટ કરેલ દસ્તાવેજ છે.',
  'Generated on': 'જનરેટ થયાની તારીખ',
};

export function t(key: string): string {
  return (GUJARATI_TRANSLATIONS as any)[key] || key;
}

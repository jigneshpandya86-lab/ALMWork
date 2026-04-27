import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SchoolDocGenie - School Document Generator',
  description:
    'Generate professional school documents (marksheets, leaving certificates, periodic evaluations) powered by Google Gemini AI.',
  keywords: 'school, document, generator, marksheet, leaving certificate, PDF, AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-800 text-lg">SchoolDocGenie</span>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              Powered by Google Gemini AI
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
            <p>SchoolDocGenie &mdash; Professional school document generation, 100% in your browser.</p>
            <p className="mt-1">No data leaves your device. API calls go directly to Google Gemini.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

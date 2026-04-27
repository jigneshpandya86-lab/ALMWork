import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SchoolDocGenie — School Document Generator',
  description:
    'Generate professional school documents (marksheets, leaving certificates, periodic evaluations) powered by Google Gemini AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-white/10"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}>
          <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight">SchoolDocGenie</span>
                <span className="hidden sm:inline ml-2 text-indigo-200 text-xs">by Vidya Mandir</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>

        <footer className="mt-20 border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">SchoolDocGenie</span>
            </div>
            <p className="text-xs text-slate-400 text-center">
              100% browser-based &mdash; no data leaves your device &mdash; API calls go directly to Google Gemini
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

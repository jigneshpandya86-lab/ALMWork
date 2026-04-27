import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'SchoolDocGenie — School Document Generator',
  description: 'Generate professional marksheets, leaving certificates, and evaluation reports for school students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />

        <main className="max-w-5xl mx-auto px-5 py-8">
          <div className="surface-panel p-4 md:p-6">
            {children}
          </div>
        </main>

        <footer className="mt-16 border-t" style={{ borderColor: 'rgba(199,210,254,0.4)', background: 'rgba(255,255,255,0.5)' }}>
          <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">SchoolDocGenie</span>
            </div>
            <p className="text-xs text-slate-400 text-center">
              100% browser-based &mdash; your data never leaves your device &mdash; built with Next.js
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

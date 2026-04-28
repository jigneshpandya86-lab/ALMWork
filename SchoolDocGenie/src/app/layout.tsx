import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'SchoolDocGenie — School Document Generator',
  description: 'Generate professional marksheets, leaving certificates, and evaluation reports for school students.',
};

const BOTTOM_NAV = [
  {
    href: '#step-upload',
    label: 'Upload',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    ),
  },
  {
    href: '#step-preview',
    label: 'Students',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20h10M12 8a3 3 0 100-6 3 3 0 000 6z" />
    ),
  },
  {
    href: '#step-generate',
    label: 'Generate',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />

        <main className="max-w-6xl mx-auto px-4 md:px-5 py-6 pb-24 md:pb-8">
          <div className="surface-panel p-4 md:p-6">{children}</div>
        </main>

        <footer className="mt-10 border-t" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#146eb4,#ff9900)' }}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">SchoolDocGenie</span>
            </div>
            <p className="text-xs text-slate-500 text-center">Lightweight workflow for uploading student data and generating polished school documents.</p>
          </div>
        </footer>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-3">
          <div className="bottom-nav-shell">
            {BOTTOM_NAV.map((item) => (
              <a key={item.href} href={item.href} className="bottom-nav-item">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </body>
    </html>
  );
}

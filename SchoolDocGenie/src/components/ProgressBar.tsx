'use client';

import React from 'react';
import { ProgressBarProps } from '@/types';

export default function ProgressBar({ current, total, currentStudentName, status }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  const barStyle =
    status === 'complete' ? { background: 'linear-gradient(90deg, #10b981, #059669)' }
    : status === 'error'  ? { background: '#ef4444' }
    : { background: 'linear-gradient(90deg, #1e40af, #4f46e5, #7c3aed)' };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 truncate max-w-xs">
          {status === 'generating' && `Generating for ${currentStudentName}…`}
          {status === 'complete' && 'All documents generated!'}
          {status === 'error' && 'Generation stopped due to an error.'}
        </span>
        <span className="font-bold text-slate-700 ml-2 flex-shrink-0 tabular-nums">
          {current}/{total}
          <span className="text-slate-400 font-normal ml-1">({pct}%)</span>
        </span>
      </div>

      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{ width: `${pct}%`, ...barStyle }}
        />
      </div>

      {status === 'complete' && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          {total} PDF{total !== 1 ? 's' : ''} ready to download
        </div>
      )}

      {status === 'generating' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

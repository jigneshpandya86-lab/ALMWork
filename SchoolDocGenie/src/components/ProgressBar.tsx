'use client';

import React from 'react';
import { ProgressBarProps } from '@/types';

export default function ProgressBar({ current, total, currentStudentName, status }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  const barGradient =
    status === 'complete' ? 'linear-gradient(90deg,#059669,#10b981,#34d399)'
    : status === 'error'  ? 'linear-gradient(90deg,#ef4444,#f87171)'
    : 'linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7,#7c3aed,#4f46e5)';

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'generating' && (
            <div className="flex gap-0.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  style={{ animation:`bounce3 1s ease-in-out infinite`, animationDelay:`${i*0.15}s` }} />
              ))}
            </div>
          )}
          {status === 'complete' && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          )}
          <span className="text-sm font-medium text-slate-600 truncate max-w-xs">
            {status === 'generating' && `${currentStudentName}`}
            {status === 'complete' && `All ${total} documents generated!`}
            {status === 'error' && 'Generation stopped'}
          </span>
        </div>
        <span className="text-sm font-bold tabular-nums ml-3 flex-shrink-0"
          style={{ color: status === 'complete' ? '#059669' : status === 'error' ? '#ef4444' : '#4f46e5' }}>
          {pct}%
        </span>
      </div>

      {/* Bar track */}
      <div className="h-3 rounded-full overflow-hidden" style={{ background:'rgba(99,102,241,0.1)' }}>
        <div
          className={`h-full rounded-full progress-fill ${status === 'generating' ? 'progress-pulse' : ''}`}
          style={{
            width: `${pct}%`,
            background: barGradient,
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* Sub-label */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{current} of {total} processed</span>
        {status === 'generating' && (
          <span className="italic">Processing…</span>
        )}
        {status === 'complete' && (
          <span className="font-semibold text-emerald-600">Ready to download ↓</span>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { ProgressBarProps } from '@/types';

export default function ProgressBar({ current, total, currentStudentName, status }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  const statusLabel: Record<typeof status, string> = {
    idle: '',
    generating: `Generating for ${currentStudentName}…`,
    complete: 'All documents generated!',
    error: 'Generation stopped due to an error.',
  };

  const barColor: Record<typeof status, string> = {
    idle: 'bg-gray-400',
    generating: 'bg-blue-600',
    complete: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 truncate max-w-xs">{statusLabel[status]}</span>
        <span className="font-semibold text-gray-800 ml-2 flex-shrink-0">
          {current}/{total} ({pct}%)
        </span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor[status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {status === 'complete' && (
        <p className="text-green-600 text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          All {total} PDFs generated successfully!
        </p>
      )}
    </div>
  );
}

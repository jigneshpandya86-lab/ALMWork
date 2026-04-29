'use client';

import React from 'react';

type ProgressBarProps = {
  progressStatus: string;
  percentage?: number;
};

export default function ProgressBar({ progressStatus, percentage = 0 }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{progressStatus}</span>
        <span>{Math.max(0, Math.min(100, Math.round(percentage)))}%</span>
      </div>
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-3 bg-indigo-600 transition-all duration-200" style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} />
      </div>
    </div>
  );
}

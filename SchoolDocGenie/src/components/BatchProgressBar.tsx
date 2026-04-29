'use client';

import React from 'react';

type BatchProgressBarProps = {
  status: string;
  percentage: number;
};

export default function BatchProgressBar({ status, percentage }: BatchProgressBarProps) {
  const safe = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-700">
        <span>{status}</span>
        <span>{safe}%</span>
      </div>
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 transition-all duration-200" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';

type BatchTemplateSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

type DesignIndex = { reports: Array<{ id: string; name: string }> };

export default function BatchTemplateSelector({ value, onChange }: BatchTemplateSelectorProps) {
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch('/data/templates/report_designs.json');
      if (!response.ok) return;
      const json = (await response.json()) as DesignIndex;
      setOptions(json.reports ?? []);
    }
    load();
  }, []);

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="batch-template">Batch Template</label>
      <select
        id="batch-template"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
      >
        <option value="">Select report design</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.name}</option>
        ))}
      </select>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';

type ReportDesignList = {
  reports: Array<{ id: string; name: string }>;
};

type TemplateSelectorProps = {
  value: string;
  onChange: (templateKey: string) => void;
};

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/data/templates/report_designs.json');
        if (!response.ok) throw new Error('Failed to load templates');
        const data = (await response.json()) as ReportDesignList;
        setTemplates(data.reports ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  return (
    <div className="space-y-2">
      <label htmlFor="template-selector" className="block text-sm font-medium text-slate-700">Report Design</label>
      <select
        id="template-selector"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
      >
        <option value="">{loading ? 'Loading templates...' : 'Select a template'}</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>{template.name}</option>
        ))}
      </select>
    </div>
  );
}

import React from 'react';
import { DocumentHeaderConfig } from '@/types';

type SchoolHeaderBlockProps = {
  config: DocumentHeaderConfig;
};

const SchoolHeaderBlock: React.FC<SchoolHeaderBlockProps> = ({ config }) => (
  <header className="border-b border-slate-300 pb-4 mb-4 text-center">
    <h1 className="text-2xl font-bold tracking-wide">{config.line1}</h1>
    {config.line2 ? <h2 className="text-xl font-semibold mt-1">{config.line2}</h2> : null}
    {config.line3 ? <h3 className="text-lg font-medium mt-1">{config.line3}</h3> : null}
    {config.line4 ? <h4 className="text-sm italic text-slate-600 mt-1">{config.line4}</h4> : null}
  </header>
);

export default SchoolHeaderBlock;

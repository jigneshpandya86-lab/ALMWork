import React from 'react';

type SignatureFooterBlockProps = {
  labels: string[];
};

const SignatureFooterBlock: React.FC<SignatureFooterBlockProps> = ({ labels }) => (
  <footer className="mt-10 pt-6">
    <div className="flex items-end justify-between gap-6">
      {labels.map((label) => (
        <div key={label} className="flex-1 text-center">
          <div className="border-t border-slate-500 mb-2" />
          <p className="text-sm font-medium">{label}</p>
        </div>
      ))}
    </div>
  </footer>
);

export default SignatureFooterBlock;

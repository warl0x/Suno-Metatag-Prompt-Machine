
import React from 'react';

interface TagBadgeProps {
  label: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({ label }) => (
  <span className="inline-block px-2 py-1 m-1 text-xs font-medium bg-slate-800 text-cyan-400 border border-slate-700 rounded hover:border-cyan-500 transition-colors cursor-default">
    [{label}]
  </span>
);

export default TagBadge;

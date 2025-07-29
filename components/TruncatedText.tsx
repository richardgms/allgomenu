'use client';

import { useState } from 'react';

interface TruncatedTextProps {
  text: string | null | undefined;
  maxLength: number;
  className?: string;
}

export default function TruncatedText({ text, maxLength, className = '' }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null;
  }

  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique se propague para outros elementos
    setIsExpanded(!isExpanded);
  };

  return (
    <span className={className}>
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <button 
        onClick={toggleExpanded} 
        className="text-[var(--cor-primaria-500)] hover:text-[var(--cor-primaria-700)] ml-1 font-semibold focus:outline-none transition-colors duration-200"
      >
        {isExpanded ? 'ver menos' : 'ver mais'}
      </button>
    </span>
  );
} 
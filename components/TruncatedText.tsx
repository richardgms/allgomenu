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
      <button onClick={toggleExpanded} className="text-blue-600 hover:text-blue-800 ml-1 font-semibold focus:outline-none">
        {isExpanded ? 'ver menos' : 'ver mais'}
      </button>
    </span>
  );
} 
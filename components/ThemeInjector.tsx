import React from 'react';

const formatToCssVar = (key: string) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

export function ThemeStyle({ palette }: { palette: Record<string, string> }) {
  if (!palette || typeof palette !== 'object') {
    return null;
  }

  const cssVariables = Object.entries(palette)
    .filter(([_, value]) => value && typeof value === 'string')
    .map(([key, value]) => `${formatToCssVar(key)}: ${value};`)
    .join('\n');

  if (!cssVariables) {
    return null;
  }

  return (
    <style 
      dangerouslySetInnerHTML={{ 
        __html: `
          :root { 
            ${cssVariables}
          }
        ` 
      }} 
    />
  );
} 
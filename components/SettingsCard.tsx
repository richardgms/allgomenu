'use client';

import { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export default function SettingsCard({
  title,
  description,
  icon,
  children,
  className = '',
  headerAction
}: SettingsCardProps) {
  return (
    <div className={`admin-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold admin-text-primary mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm admin-text-muted leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
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
    <div className={`settings-card ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="settings-card-icon">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="settings-card-title">
              {title}
            </h3>
            {description && (
              <p className="settings-card-description">
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
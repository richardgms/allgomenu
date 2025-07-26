'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  label: string;
  value: string | number;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  formatter?: (value: string) => string;
  validator?: (value: string) => boolean | string;
  onConfirm: (value: string | number) => void;
  onCancel?: () => void;
  className?: string;
  rows?: number;
  maxLength?: number;
  description?: string;
}

export default function EditableField({
  label,
  value,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  formatter,
  validator,
  onConfirm,
  onCancel,
  className = '',
  rows = 3,
  maxLength,
  description
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== 'textarea') {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, type]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(String(value));
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(String(value));
    setError(null);
    onCancel?.();
  };

  const handleConfirm = () => {
    // Validação
    if (required && !editValue.trim()) {
      setError('Este campo é obrigatório');
      return;
    }

    if (validator) {
      const validationResult = validator(editValue);
      if (validationResult !== true) {
        setError(typeof validationResult === 'string' ? validationResult : 'Valor inválido');
        return;
      }
    }

    // Conversão do valor
    const finalValue = type === 'number' ? Number(editValue) : editValue;
    
    onConfirm(finalValue);
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Aplicar formatação se existir
    if (formatter) {
      newValue = formatter(newValue);
    }
    
    setEditValue(newValue);
    
    // Limpar erro quando o usuário começar a digitar
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = String(value || '');
  const isEmpty = !displayValue.trim();

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium admin-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Edit Button */}
        {!isEditing && !disabled && (
          <button
            onClick={handleEdit}
            className="admin-btn-ghost p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Field Display/Edit */}
      <div className="relative">
        {!isEditing ? (
          // Display Mode
          <div
            className={`admin-input min-h-[44px] flex items-center cursor-pointer ${
              isEmpty ? 'admin-text-muted italic' : 'admin-text-primary'
            } ${disabled ? 'opacity-50' : 'hover:admin-border-hover'}`}
            onClick={handleEdit}
          >
            {isEmpty ? (placeholder || 'Clique para adicionar...') : displayValue}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-2">
            {type === 'textarea' ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                className={`admin-input w-full resize-none ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`admin-input w-full ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="admin-btn-ghost px-3 py-1.5 text-red-600 hover:bg-red-50"
                title="Cancelar (Esc)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 6-12 12"/>
                  <path d="m6 6 12 12"/>
                </svg>
                Cancelar
              </button>
              
              <button
                onClick={handleConfirm}
                className="admin-btn-primary px-3 py-1.5"
                title="Confirmar (Enter)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Confirmar
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
            
            {/* Character Counter */}
            {maxLength && (
              <div className="text-xs admin-text-muted text-right">
                {editValue.length}/{maxLength}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs admin-text-muted">{description}</p>
      )}
    </div>
  );
}
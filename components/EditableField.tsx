'use client';

import { useState, useRef, useEffect } from 'react';
import { Edit3, X, Check, AlertCircle } from 'lucide-react';

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
    <div className={`editable-field ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="editable-field-label">
          {label}
          {required && <span className="editable-field-required">*</span>}
        </label>
        
        {/* Edit Button */}
        {!isEditing && !disabled && (
          <button
            onClick={handleEdit}
            className="editable-field-edit-btn"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Field Display/Edit */}
      <div className="relative">
        {!isEditing ? (
          // Display Mode
          <div
            className={`editable-field-display ${
              isEmpty ? 'editable-field-display-empty' : 'editable-field-display-filled'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'editable-field-display-hover'}`}
            onClick={handleEdit}
          >
            {isEmpty ? (placeholder || 'Clique para adicionar...') : displayValue}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-3">
            {type === 'textarea' ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                className={`editable-field-input resize-none ${
                  error ? 'editable-field-input-error' : 'editable-field-input-normal'
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
                className={`editable-field-input ${
                  error ? 'editable-field-input-error' : 'editable-field-input-normal'
                }`}
              />
            )}
            
            {/* Action Buttons */}
            <div className="editable-field-actions">
              <button
                onClick={handleCancel}
                className="editable-field-btn-cancel"
                title="Cancelar (Esc)"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              
              <button
                onClick={handleConfirm}
                className="editable-field-btn-confirm"
                title="Confirmar (Enter)"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="editable-field-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            
            {/* Character Counter */}
            {maxLength && (
              <div className="text-xs text-neutra-500 text-right">
                {editValue.length}/{maxLength}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="editable-field-description">{description}</p>
      )}
    </div>
  );
}
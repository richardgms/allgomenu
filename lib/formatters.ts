// Formatadores para diferentes tipos de dados

/**
 * Formatar número de WhatsApp brasileiro
 * Formato: +55 (83) 98807-3784
 */
export function formatWhatsApp(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se começar com 55, assume que já tem código do país
  let cleanNumbers = numbers;
  
  // Se não começar com 55 e tiver mais de 11 dígitos, remove o excesso do início
  if (!numbers.startsWith('55') && numbers.length > 11) {
    cleanNumbers = numbers.slice(-11);
  }
  
  // Se começar com 55, usa como está
  if (numbers.startsWith('55')) {
    cleanNumbers = numbers;
  }
  
  // Adiciona 55 se não tiver código do país e tiver 11 dígitos
  if (!cleanNumbers.startsWith('55') && cleanNumbers.length === 11) {
    cleanNumbers = '55' + cleanNumbers;
  }
  
  // Formatar baseado no tamanho
  if (cleanNumbers.length === 0) return '';
  if (cleanNumbers.length <= 2) return `+${cleanNumbers}`;
  if (cleanNumbers.length <= 4) return `+${cleanNumbers.slice(0, 2)} (${cleanNumbers.slice(2)}`;
  if (cleanNumbers.length <= 6) return `+${cleanNumbers.slice(0, 2)} (${cleanNumbers.slice(2, 4)}) ${cleanNumbers.slice(4)}`;
  if (cleanNumbers.length <= 10) return `+${cleanNumbers.slice(0, 2)} (${cleanNumbers.slice(2, 4)}) ${cleanNumbers.slice(4, 9)}-${cleanNumbers.slice(9)}`;
  
  // Formato completo: +55 (83) 98807-3784
  return `+${cleanNumbers.slice(0, 2)} (${cleanNumbers.slice(2, 4)}) ${cleanNumbers.slice(4, 9)}-${cleanNumbers.slice(9, 13)}`;
}

/**
 * Formatar telefone brasileiro
 * Formato: (83) 98807-3784
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  
  // Formato completo: (83) 98807-3784
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Formatar CEP brasileiro
 * Formato: 58000-000
 */
export function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 5) return numbers;
  
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Formatar moeda brasileira
 * Formato: R$ 12,50
 */
export function formatCurrency(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers) / 100;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatar número simples com separadores de milhar
 * Formato: 1.234.567
 */
export function formatNumber(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  
  return new Intl.NumberFormat('pt-BR').format(parseInt(numbers));
}

/**
 * Validadores
 */

export function validateWhatsApp(value: string): boolean | string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return 'WhatsApp é obrigatório';
  
  // Deve ter pelo menos 13 dígitos (55 + DDD + 9 dígitos)
  if (numbers.length < 13) return 'WhatsApp deve ter formato completo (+55 83 98807-3784)';
  
  // Deve começar com 55 (Brasil)
  if (!numbers.startsWith('55')) return 'WhatsApp deve começar com +55 (Brasil)';
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(numbers.slice(2, 4));
  if (ddd < 11 || ddd > 99) return 'DDD inválido';
  
  // Celular deve começar com 9
  if (numbers.charAt(4) !== '9') return 'Número deve ser de celular (começar com 9)';
  
  return true;
}

export function validatePhone(value: string): boolean | string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return 'Telefone é obrigatório';
  
  // Deve ter 10 ou 11 dígitos
  if (numbers.length < 10 || numbers.length > 11) return 'Telefone deve ter 10 ou 11 dígitos';
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) return 'DDD inválido';
  
  return true;
}

export function validateEmail(value: string): boolean | string {
  if (value.length === 0) return 'Email é obrigatório';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Email inválido';
  
  return true;
}

export function validateCEP(value: string): boolean | string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return 'CEP é obrigatório';
  if (numbers.length !== 8) return 'CEP deve ter 8 dígitos';
  
  return true;
}

export function validateCurrency(value: string): boolean | string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return 'Valor é obrigatório';
  
  const amount = parseInt(numbers) / 100;
  if (amount < 0) return 'Valor deve ser positivo';
  if (amount > 999999) return 'Valor muito alto';
  
  return true;
}
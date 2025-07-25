import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

export function generateOrderCode(): string {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-6);
  return `PED${timestamp}`;
}

// Função para converter hex para HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { h: 0, s: 0, l: 0 };
  }

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Função para converter HSL para hex
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Função para gerar paleta de cores baseada na cor primária
export function generateColorPalette(primaryColor: string) {
  const hsl = hexToHsl(primaryColor);
  
  return {
    primary: primaryColor,
    primaryLight: hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 95)),
    primaryLighter: hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 35, 95)),
    primaryDark: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 5)),
    primaryDarker: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 35, 5)),
    // Variações com saturação reduzida para elementos secundários
    primaryMuted: hslToHex(hsl.h, Math.max(hsl.s - 40, 10), hsl.l),
    primaryVeryLight: hslToHex(hsl.h, Math.max(hsl.s - 60, 5), Math.min(hsl.l + 45, 98)),
  };
}

// Função para detectar se uma cor é clara (próxima ao branco)
export function isLightColor(hexColor: string): boolean {
  const hsl = hexToHsl(hexColor);
  // Considera uma cor clara se a luminosidade for maior que 80%
  return hsl.l > 80;
}

// Função para gerar paleta de 6 cores (3 da primária + 3 da secundária)
export function generateSixColorPalette(primaryColor: string, secondaryColor: string) {
  const primaryHsl = hexToHsl(primaryColor);
  const secondaryHsl = hexToHsl(secondaryColor);

  // Gerar 3 variações da cor primária com diferentes luminosidades
  const primaryPalette = [
    hslToHex(primaryHsl.h, Math.max(primaryHsl.s - 10, 10), Math.min(primaryHsl.l + 25, 90)), // Mais clara
    primaryColor, // Original
    hslToHex(primaryHsl.h, Math.min(primaryHsl.s + 10, 90), Math.max(primaryHsl.l - 25, 15)) // Mais escura
  ];

  // Gerar 3 variações da cor secundária com diferentes luminosidades
  const secondaryPalette = [
    hslToHex(secondaryHsl.h, Math.max(secondaryHsl.s - 10, 10), Math.min(secondaryHsl.l + 25, 90)), // Mais clara
    secondaryColor, // Original
    hslToHex(secondaryHsl.h, Math.min(secondaryHsl.s + 10, 90), Math.max(secondaryHsl.l - 25, 15)) // Mais escura
  ];

  return {
    primary: primaryPalette,
    secondary: secondaryPalette,
    // Cores individuais para fácil acesso
    primaryLight: primaryPalette[0],
    primaryBase: primaryPalette[1],
    primaryDark: primaryPalette[2],
    secondaryLight: secondaryPalette[0],
    secondaryBase: secondaryPalette[1],
    secondaryDark: secondaryPalette[2]
  };
}

// Função para verificar contraste entre duas cores
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

// Função helper para converter hex para RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Função para aplicar tema inteligente baseado na claridade da cor primária usando paleta de 6 cores
export function applyIntelligentTheme(primaryColor: string, secondaryColor: string) {
  const isLightPrimary = isLightColor(primaryColor);
  const palette = generateSixColorPalette(primaryColor, secondaryColor);
  
  // Verificar contrastes para garantir acessibilidade
  const whiteContrast = getContrastRatio('#ffffff', palette.primaryDark);
  const darkTextContrast = getContrastRatio('#1F2937', palette.primaryLight);
  
  if (isLightPrimary) {
    // Se a cor primária for clara, usar ela como background e cores mais escuras para elementos
    return {
      backgroundColor: palette.primaryLight,
      buttonColor: whiteContrast >= 4.5 ? palette.primaryDark : palette.secondaryDark,
      buttonColorHover: palette.primaryBase,
      textColor: '#1F2937',
      accentColor: palette.secondaryBase,
      borderColor: palette.primaryBase,
      useSecondaryForButtons: true,
      palette
    };
  } else {
    // Se a cor primária for escura, usar configuração normal com cores mais claras para backgrounds
    return {
      backgroundColor: '#ffffff',
      buttonColor: palette.primaryBase,
      buttonColorHover: palette.primaryDark,
      textColor: '#1F2937',
      accentColor: palette.secondaryBase,
      borderColor: palette.primaryLight,
      useSecondaryForButtons: false,
      palette
    };
  }
}

export function isRestaurantOpen(openingHours: any): boolean {
  if (!openingHours) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const dayMap: { [key: string]: string } = {
    'segunda-feira': 'monday',
    'terça-feira': 'tuesday',
    'quarta-feira': 'wednesday',
    'quinta-feira': 'thursday',
    'sexta-feira': 'friday',
    'sábado': 'saturday',
    'domingo': 'sunday'
  };
  
  const dayKey = dayMap[currentDay];
  const daySchedule = openingHours[dayKey];
  
  if (!daySchedule || daySchedule.closed) {
    return false;
  }
  
  // Verificar se está dentro do horário de funcionamento
  const isWithinMainHours = currentTime >= daySchedule.open && currentTime <= daySchedule.close;
  
  if (!isWithinMainHours) {
    return false;
  }
  
  // Verificar se está dentro de algum intervalo (quando o restaurante fica fechado)
  if (daySchedule.intervals && daySchedule.intervals.length > 0) {
    for (const interval of daySchedule.intervals) {
      if (currentTime >= interval.start && currentTime <= interval.end) {
        return false; // Está no intervalo, logo fechado
      }
    }
  }
  
  return true;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
} 
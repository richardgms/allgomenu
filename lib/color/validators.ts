import { hexToOklch, normalizeHex } from './color-space';

/**
 * Verifica se duas cores são muito similares usando OKLCH.
 * @param color1 Cor 1 em formato hex.
 * @param color2 Cor 2 em formato hex.
 * @param threshold Distância mínima permitida no matiz (0-360). Default: 15.
 */
export function areColorsTooSimilar(color1: string, color2: string, threshold = 15): boolean {
  try {
    const hex1 = normalizeHex(color1);
    const hex2 = normalizeHex(color2);
    
    const oklch1 = hexToOklch(hex1);
    const oklch2 = hexToOklch(hex2);
    
    const diff = Math.abs(oklch1.h - oklch2.h);
    const hueDistance = Math.min(diff, 360 - diff);
    
    return hueDistance < threshold;
  } catch {
    return false;
  }
} 
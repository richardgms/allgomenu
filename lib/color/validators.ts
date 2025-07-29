import tinycolor from 'tinycolor2';

/**
 * Verifica se duas cores são muito similares no canal Hue (matiz).
 * @param color1 Cor 1 em formato hex/rgb/etc.
 * @param color2 Cor 2 em formato hex/rgb/etc.
 * @param threshold Distância mínima permitida no círculo de matiz (0-360). Default: 15.
 */
export function areColorsTooSimilar(color1: string, color2: string, threshold = 15): boolean {
  const hsv1 = tinycolor(color1).toHsv();
  const hsv2 = tinycolor(color2).toHsv();
  const diff = Math.abs(hsv1.h - hsv2.h);
  const hueDistance = Math.min(diff, 360 - diff);
  return hueDistance < threshold;
} 
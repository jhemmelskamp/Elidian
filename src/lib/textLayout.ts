import type { TextLayoutResult } from '../types';

type Measure = (text: string, size: number) => number;

function breakLongToken(token: string, maxWidth: number, size: number, measure: Measure): string[] {
  const parts: string[] = [];
  let current = '';

  for (const ch of token) {
    const next = `${current}${ch}`;
    if (current !== '' && measure(next, size) > maxWidth) {
      parts.push(current);
      current = ch;
      continue;
    }
    current = next;
  }

  if (current) {
    parts.push(current);
  }
  return parts;
}

export function wrapText(text: string, maxWidth: number, size: number, measure: Measure): string[] {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return [];
  }

  const words = cleaned.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const rawWord of words) {
    let word = rawWord;
    if (measure(word, size) > maxWidth) {
      const chunks = breakLongToken(word, maxWidth, size, measure);
      for (const chunk of chunks) {
        if (!currentLine) {
          currentLine = chunk;
          continue;
        }
        if (measure(`${currentLine} ${chunk}`, size) <= maxWidth) {
          currentLine = `${currentLine} ${chunk}`;
          continue;
        }
        lines.push(currentLine);
        currentLine = chunk;
      }
      continue;
    }

    if (!currentLine) {
      currentLine = word;
      continue;
    }
    const candidate = `${currentLine} ${word}`;
    if (measure(candidate, size) <= maxWidth) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export function findBestTextLayout(params: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  minFontSize?: number;
  maxFontSize?: number;
  lineHeightFactor?: number;
  safetyMarginPx?: number;
  measure: Measure;
}): TextLayoutResult {
  const {
    text,
    maxWidth,
    maxHeight,
    measure,
    minFontSize = 14,
    maxFontSize = 72,
    lineHeightFactor = 1.2,
    safetyMarginPx = 2,
  } = params;

  const cleaned = text.trim();
  if (!cleaned) {
    return { fontSize: minFontSize, lineHeight: minFontSize * lineHeightFactor, lines: [] };
  }

  let low = minFontSize;
  let high = maxFontSize;
  let best: TextLayoutResult = {
    fontSize: minFontSize,
    lineHeight: minFontSize * lineHeightFactor,
    lines: wrapText(cleaned, maxWidth, minFontSize, measure),
  };

  while (low <= high) {
    const size = Math.floor((low + high) / 2);
    const lines = wrapText(cleaned, maxWidth, size, measure);
    const lineHeight = size * lineHeightFactor;
    const requiredHeight = lines.length * lineHeight;

    if (lines.length > 0 && requiredHeight <= maxHeight - safetyMarginPx) {
      best = { fontSize: size, lineHeight, lines };
      low = size + 1;
    } else {
      high = size - 1;
    }
  }

  return best;
}


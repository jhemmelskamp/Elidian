import { describe, expect, it } from 'vitest';
import { findBestTextLayout, wrapText } from './textLayout';

function measure(text: string, size: number): number {
  return text.length * size * 0.56;
}

describe('textLayout', () => {
  it('wraps short text into one line when enough width exists', () => {
    const lines = wrapText('Build fast', 400, 24, measure);
    expect(lines).toEqual(['Build fast']);
  });

  it('wraps long text into multiple lines', () => {
    const lines = wrapText('Heute ist ein guter Tag um anzufangen', 120, 20, measure);
    expect(lines.length).toBeGreaterThan(1);
  });

  it('breaks very long words', () => {
    const lines = wrapText('Supercalifragilisticexpialidocious', 80, 18, measure);
    expect(lines.length).toBeGreaterThan(1);
  });

  it('returns empty lines for whitespace-only input', () => {
    const lines = wrapText('   ', 120, 20, measure);
    expect(lines).toEqual([]);
  });

  it('finds a fitting font size using binary search bounds', () => {
    const layout = findBestTextLayout({
      text: 'Disziplin schlägt Motivation',
      maxWidth: 180,
      maxHeight: 80,
      maxFontSize: 60,
      measure,
    });
    expect(layout.fontSize).toBeGreaterThanOrEqual(14);
    expect(layout.fontSize).toBeLessThanOrEqual(60);
    expect(layout.lines.length).toBeGreaterThan(0);
  });
});

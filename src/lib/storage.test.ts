import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../types';
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  loadSettings,
  removeHistoryEntry,
  saveSettings,
  sanitizeSettings,
} from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('saves and loads settings', () => {
    const next = { ...DEFAULT_SETTINGS, width: 800, category: 'film' as const, bgColor: '#102C6A' };
    saveSettings(next);
    expect(loadSettings()).toMatchObject(next);
  });

  it('falls back to defaults for invalid settings values', () => {
    localStorage.setItem(
      'elidian.settings.v1',
      JSON.stringify({ version: 2, width: 99999, bgColor: 'x', textColor: 'oops' }),
    );
    const loaded = loadSettings();
    expect(loaded.width).toBe(2000);
    expect(loaded.bgColor).toBe(DEFAULT_SETTINGS.bgColor);
    expect(loaded.textColor).toBe('#FFE0B5');
  });

  it('uses #FFE0B5 as default text color', () => {
    const loaded = loadSettings();
    expect(loaded.textColor).toBe('#FFE0B5');
  });

  it('resets to new defaults if stored settings version is outdated', () => {
    localStorage.setItem('elidian.settings.v1', JSON.stringify({ version: 1, width: 640, height: 640 }));
    const loaded = loadSettings();
    expect(loaded.width).toBe(1024);
    expect(loaded.height).toBe(1024);
    expect(loaded.version).toBe(2);
  });

  it('stores history and keeps newest first with max 100 items', () => {
    vi.useFakeTimers();
    const baseTime = new Date('2026-02-21T12:00:00.000Z').getTime();
    for (let i = 0; i < 101; i += 1) {
      vi.setSystemTime(new Date(baseTime + i * 1000));
      addHistoryEntry(`Item ${i}`, DEFAULT_SETTINGS);
    }

    const history = loadHistory();
    expect(history).toHaveLength(100);
    expect(history[0].text).toBe('Item 100');
  });

  it('can remove and clear history', () => {
    const created = addHistoryEntry('Hallo', DEFAULT_SETTINGS);
    const id = created[0].id;
    expect(removeHistoryEntry(id)).toHaveLength(0);
    addHistoryEntry('Neu', DEFAULT_SETTINGS);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it('sanitizeSettings keeps values in bounds', () => {
    const sanitized = sanitizeSettings({ width: 10, height: 3000, padding: 200, baseFontSize: 999 });
    expect(sanitized.width).toBe(200);
    expect(sanitized.height).toBe(2000);
    expect(sanitized.padding).toBe(120);
    expect(sanitized.baseFontSize).toBe(200);
  });
});

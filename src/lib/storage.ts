import {
  CATEGORY_BG,
  DEFAULT_SETTINGS,
  IMAGE_FONT_FAMILY,
  SETTINGS_VERSION,
  SETTINGS_LIMITS,
  type AppSettings,
  type HistoryItem,
  type PostCategory,
} from '../types';

const SETTINGS_KEY = 'elidian.settings.v1';
const HISTORY_KEY = 'elidian.history.v1';
const HISTORY_LIMIT = 100;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeColor(color: string, fallback: string): string {
  const trimmed = color.trim();
  const validHex = /^#([0-9a-fA-F]{6})$/;
  return validHex.test(trimmed) ? trimmed.toUpperCase() : fallback;
}

function normalizeCategory(category: unknown): PostCategory {
  if (category === 'film' || category === 'zitat' || category === 'aussage') {
    return category;
  }
  return 'aussage';
}

export function sanitizeSettings(input: Partial<AppSettings>): AppSettings {
  const category = normalizeCategory(input.category ?? DEFAULT_SETTINGS.category);
  return {
    category,
    width: Math.round(clamp(input.width ?? DEFAULT_SETTINGS.width, SETTINGS_LIMITS.width.min, SETTINGS_LIMITS.width.max)),
    height: Math.round(
      clamp(input.height ?? DEFAULT_SETTINGS.height, SETTINGS_LIMITS.height.min, SETTINGS_LIMITS.height.max),
    ),
    baseFontSize: Math.round(
      clamp(
        input.baseFontSize ?? DEFAULT_SETTINGS.baseFontSize,
        SETTINGS_LIMITS.baseFontSize.min,
        SETTINGS_LIMITS.baseFontSize.max,
      ),
    ),
    bgColor: normalizeColor(CATEGORY_BG[category], DEFAULT_SETTINGS.bgColor),
    textColor: normalizeColor(input.textColor ?? DEFAULT_SETTINGS.textColor, DEFAULT_SETTINGS.textColor),
    fontFamily: IMAGE_FONT_FAMILY,
    logoScale: clamp(input.logoScale ?? DEFAULT_SETTINGS.logoScale, SETTINGS_LIMITS.logoScale.min, SETTINGS_LIMITS.logoScale.max),
    padding: Math.round(
      clamp(input.padding ?? DEFAULT_SETTINGS.padding, SETTINGS_LIMITS.padding.min, SETTINGS_LIMITS.padding.max),
    ),
    version: SETTINGS_VERSION,
  };
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    if (parsed.version !== SETTINGS_VERSION) {
      return DEFAULT_SETTINGS;
    }
    return sanitizeSettings(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitizeSettings(settings)));
}

export function loadHistory(): HistoryItem[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is HistoryItem => {
        return typeof item?.id === 'string' && typeof item?.text === 'string' && typeof item?.createdAt === 'string';
      })
      .map((item) => ({
        ...item,
        text: item.text.trim(),
        settingsSnapshot: sanitizeSettings(item.settingsSnapshot),
      }))
      .filter((item) => item.text.length > 0)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeHistory(items: HistoryItem[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)));
}

export function addHistoryEntry(text: string, settingsSnapshot: AppSettings): HistoryItem[] {
  const cleanedText = text.trim();
  if (!cleanedText) {
    return loadHistory();
  }
  const next: HistoryItem = {
    id: crypto.randomUUID(),
    text: cleanedText,
    createdAt: new Date().toISOString(),
    settingsSnapshot: sanitizeSettings(settingsSnapshot),
  };
  const updated = [next, ...loadHistory()].slice(0, HISTORY_LIMIT);
  writeHistory(updated);
  return updated;
}

export function removeHistoryEntry(id: string): HistoryItem[] {
  const updated = loadHistory().filter((item) => item.id !== id);
  writeHistory(updated);
  return updated;
}

export function clearHistory(): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(HISTORY_KEY);
}

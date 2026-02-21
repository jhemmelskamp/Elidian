export type PostCategory = 'aussage' | 'film' | 'zitat';

export const CATEGORY_BG: Record<PostCategory, string> = {
  aussage: '#0A1D37',
  film: '#102C6A',
  zitat: '#0D3D53',
};

export const IMAGE_FONT_FAMILY = "'Aptos Narrow', 'Arial Narrow', 'Roboto Condensed', Arial, sans-serif";
export const IMAGE_FONT_WEIGHT = 700;
export const DEFAULT_FONT_SIZE = 128;
export const LOGO_OFFSET_FROM_CENTER_CM = -6.4;
export const SETTINGS_VERSION = 2 as const;

export type AppSettings = {
  category: PostCategory;
  width: number;
  height: number;
  baseFontSize: number;
  bgColor: string;
  textColor: string;
  fontFamily: string;
  logoScale: number;
  padding: number;
  version: 2;
};

export type HistoryItem = {
  id: string;
  text: string;
  createdAt: string;
  settingsSnapshot: AppSettings;
};

export type RenderOptions = {
  text: string;
  settings: AppSettings;
  logoImage: HTMLImageElement;
};

export type TextLayoutResult = {
  fontSize: number;
  lineHeight: number;
  lines: string[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  category: 'aussage',
  width: 1024,
  height: 1024,
  baseFontSize: DEFAULT_FONT_SIZE,
  bgColor: CATEGORY_BG.aussage,
  textColor: '#FFE0B5',
  fontFamily: IMAGE_FONT_FAMILY,
  logoScale: 0.14,
  padding: 80,
  version: SETTINGS_VERSION,
};

export const SETTINGS_LIMITS = {
  width: { min: 200, max: 2000 },
  height: { min: 100, max: 2000 },
  baseFontSize: { min: 12, max: 200 },
  logoScale: { min: 0.05, max: 0.4 },
  padding: { min: 0, max: 120 },
} as const;

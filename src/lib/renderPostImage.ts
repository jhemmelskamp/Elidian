import { findBestTextLayout } from './textLayout';
import type { RenderOptions } from '../types';
import { IMAGE_FONT_FAMILY, IMAGE_FONT_WEIGHT, LOGO_OFFSET_FROM_CENTER_CM } from '../types';

const CM_TO_PX = 37.7952755906;
const LOGO_GLOBAL_SCALE_FACTOR = 1;
const DOWNLOAD_RENDER_SCALE = 2;

type CropBounds = { sx: number; sy: number; sw: number; sh: number };
const logoCropCache = new WeakMap<HTMLImageElement, CropBounds>();

function getLogoCropBounds(image: HTMLImageElement): CropBounds {
  const cached = logoCropCache.get(image);
  if (cached) {
    return cached;
  }

  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const probe = document.createElement('canvas');
  probe.width = w;
  probe.height = h;
  const ctx = probe.getContext('2d');
  if (!ctx) {
    const fallback = { sx: 0, sy: 0, sw: w, sh: h };
    logoCropCache.set(image, fallback);
    return fallback;
  }

  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const bounds =
    maxX >= minX && maxY >= minY
      ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
      : { sx: 0, sy: 0, sw: w, sh: h };

  logoCropCache.set(image, bounds);
  return bounds;
}

async function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return;
  }
  try {
    await document.fonts.ready;
  } catch {
    // Continue with fallback fonts if font loading fails.
  }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG-Export fehlgeschlagen.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

async function renderPostToCanvasInternal(options: RenderOptions, renderScale: number): Promise<HTMLCanvasElement> {
  const { settings, text, logoImage } = options;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(settings.width * renderScale);
  canvas.height = Math.round(settings.height * renderScale);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas-Kontext nicht verfugbar.');
  }

  ctx.scale(renderScale, renderScale);
  ctx.fillStyle = settings.bgColor;
  ctx.fillRect(0, 0, settings.width, settings.height);

  const { sx, sy, sw, sh } = getLogoCropBounds(logoImage);
  const logoAspect = sw / Math.max(sh, 1);
  const logoWidth = settings.width * settings.logoScale * LOGO_GLOBAL_SCALE_FACTOR;
  const logoHeight = logoWidth / logoAspect;
  const logoX = (settings.width - logoWidth) / 2;
  const centerY = settings.height / 2;
  const offsetPx = LOGO_OFFSET_FROM_CENTER_CM * CM_TO_PX * (settings.height / 640);
  const targetLogoY = centerY - offsetPx;
  const logoY = Math.max(0, Math.min(settings.height - logoHeight, targetLogoY));

  const textTop = settings.padding;
  const textBottom = settings.height - settings.padding;
  const textAreaWidth = settings.width - settings.padding * 2;
  const textAreaHeight = Math.max(textBottom - textTop, 0);

  const measure = (line: string, size: number) => {
    ctx.font = `${IMAGE_FONT_WEIGHT} ${size}px ${IMAGE_FONT_FAMILY}`;
    return ctx.measureText(line).width;
  };

  const layout = findBestTextLayout({
    text,
    maxWidth: textAreaWidth,
    maxHeight: textAreaHeight,
    minFontSize: settings.baseFontSize,
    maxFontSize: settings.baseFontSize,
    measure,
  });

  ctx.fillStyle = settings.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${IMAGE_FONT_WEIGHT} ${layout.fontSize}px ${IMAGE_FONT_FAMILY}`;

  const textBlockHeight = layout.lines.length * layout.lineHeight;
  const startY = textTop + (textAreaHeight - textBlockHeight) / 2 + layout.fontSize;
  for (const [index, line] of layout.lines.entries()) {
    const y = startY + index * layout.lineHeight;
    ctx.fillText(line, settings.width / 2, y);
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    logoImage,
    sx,
    sy,
    sw,
    sh,
    Math.round(logoX),
    Math.round(logoY),
    Math.round(logoWidth),
    Math.round(logoHeight),
  );
  return canvas;
}

export async function renderPostToCanvas(options: RenderOptions): Promise<HTMLCanvasElement> {
  await waitForFonts();
  return renderPostToCanvasInternal(options, 1);
}

export async function renderPostToBlob(options: RenderOptions): Promise<Blob> {
  await waitForFonts();
  const canvas = await renderPostToCanvasInternal(options, DOWNLOAD_RENDER_SCALE);
  return toBlob(canvas);
}

export async function renderPostToDataUrl(options: RenderOptions): Promise<string> {
  const canvas = await renderPostToCanvas(options);
  return canvas.toDataURL('image/png');
}

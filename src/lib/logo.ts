import logoSrc from '../assets/Bild6.png';

let logoPromise: Promise<HTMLImageElement> | null = null;

export function loadLogoImage(): Promise<HTMLImageElement> {
  if (logoPromise) {
    return logoPromise;
  }

  logoPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Logo konnte nicht geladen werden.'));
    img.src = logoSrc;
  });

  return logoPromise;
}

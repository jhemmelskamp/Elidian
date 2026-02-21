import { useState } from 'react';
import { CATEGORY_BG, DEFAULT_SETTINGS, SETTINGS_LIMITS, type AppSettings, type PostCategory } from '../types';
import { loadSettings, saveSettings, sanitizeSettings } from '../lib/storage';

type ValidationErrors = Partial<Record<keyof AppSettings, string>>;

function validate(settings: AppSettings): ValidationErrors {
  const errors: ValidationErrors = {};
  if (settings.width < SETTINGS_LIMITS.width.min || settings.width > SETTINGS_LIMITS.width.max) {
    errors.width = `Breite muss zwischen ${SETTINGS_LIMITS.width.min} und ${SETTINGS_LIMITS.width.max} liegen.`;
  }
  if (settings.height < SETTINGS_LIMITS.height.min || settings.height > SETTINGS_LIMITS.height.max) {
    errors.height = `Hoehe muss zwischen ${SETTINGS_LIMITS.height.min} und ${SETTINGS_LIMITS.height.max} liegen.`;
  }
  if (
    settings.baseFontSize < SETTINGS_LIMITS.baseFontSize.min ||
    settings.baseFontSize > SETTINGS_LIMITS.baseFontSize.max
  ) {
    errors.baseFontSize = `Schriftgroesse muss zwischen ${SETTINGS_LIMITS.baseFontSize.min} und ${SETTINGS_LIMITS.baseFontSize.max} liegen.`;
  }
  if (settings.logoScale < SETTINGS_LIMITS.logoScale.min || settings.logoScale > SETTINGS_LIMITS.logoScale.max) {
    errors.logoScale = `Logo-Skalierung muss zwischen ${SETTINGS_LIMITS.logoScale.min} und ${SETTINGS_LIMITS.logoScale.max} liegen.`;
  }
  if (settings.padding < SETTINGS_LIMITS.padding.min || settings.padding > SETTINGS_LIMITS.padding.max) {
    errors.padding = `Padding muss zwischen ${SETTINGS_LIMITS.padding.min} und ${SETTINGS_LIMITS.padding.max} liegen.`;
  }
  return errors;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  function updateField<Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]): void {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateCategory(category: PostCategory): void {
    setSettings((prev) => ({
      ...prev,
      category,
      bgColor: CATEGORY_BG[category],
    }));
  }

  function handleSave(): void {
    const nextErrors = validate(settings);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setNotice(null);
      return;
    }
    const normalized = sanitizeSettings(settings);
    saveSettings(normalized);
    setSettings(normalized);
    setErrors({});
    setNotice('Einstellungen gespeichert.');
  }

  function handleReset(): void {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    setErrors({});
    setNotice('Auf Standardwerte zurueckgesetzt.');
  }

  return (
    <section className="panel">
      <h2>Konfiguration</h2>
      <div className="settings-grid">
        <label className="label" htmlFor="category">
          Typ
        </label>
        <select
          id="category"
          className="input"
          value={settings.category}
          onChange={(event) => updateCategory(event.target.value as PostCategory)}
        >
          <option value="aussage">Aussage</option>
          <option value="film">Film</option>
          <option value="zitat">Zitat</option>
        </select>

        <label className="label" htmlFor="width">
          Breite
        </label>
        <input
          id="width"
          className="input"
          type="number"
          min={SETTINGS_LIMITS.width.min}
          max={SETTINGS_LIMITS.width.max}
          value={settings.width}
          onChange={(event) => updateField('width', Number(event.target.value))}
        />
        {errors.width ? <p className="error">{errors.width}</p> : null}

        <label className="label" htmlFor="height">
          Hoehe
        </label>
        <input
          id="height"
          className="input"
          type="number"
          min={SETTINGS_LIMITS.height.min}
          max={SETTINGS_LIMITS.height.max}
          value={settings.height}
          onChange={(event) => updateField('height', Number(event.target.value))}
        />
        {errors.height ? <p className="error">{errors.height}</p> : null}

        <label className="label" htmlFor="baseFontSize">
          Schriftgroesse
        </label>
        <input
          id="baseFontSize"
          className="input"
          type="number"
          min={SETTINGS_LIMITS.baseFontSize.min}
          max={SETTINGS_LIMITS.baseFontSize.max}
          value={settings.baseFontSize}
          onChange={(event) => updateField('baseFontSize', Number(event.target.value))}
        />
        {errors.baseFontSize ? <p className="error">{errors.baseFontSize}</p> : null}

        <label className="label" htmlFor="bgColor">
          Hintergrundfarbe (aus Typ)
        </label>
        <input id="bgColor" className="input" type="color" value={settings.bgColor} readOnly />

        <label className="label" htmlFor="textColor">
          Textfarbe
        </label>
        <input
          id="textColor"
          className="input"
          type="color"
          value={settings.textColor}
          onChange={(event) => updateField('textColor', event.target.value)}
        />

        <label className="label" htmlFor="fontFamily">
          Schriftfamilie
        </label>
        <input id="fontFamily" className="input" type="text" value={settings.fontFamily} readOnly />
        <p className="muted">Fester Wert: Aptos Narrow Bold (mit Fallback auf aehnliche Schriften).</p>

        <label className="label" htmlFor="logoScale">
          Logo-Skalierung
        </label>
        <input
          id="logoScale"
          className="input"
          type="number"
          step="0.01"
          min={SETTINGS_LIMITS.logoScale.min}
          max={SETTINGS_LIMITS.logoScale.max}
          value={settings.logoScale}
          onChange={(event) => updateField('logoScale', Number(event.target.value))}
        />
        {errors.logoScale ? <p className="error">{errors.logoScale}</p> : null}

        <label className="label" htmlFor="padding">
          Padding
        </label>
        <input
          id="padding"
          className="input"
          type="number"
          min={SETTINGS_LIMITS.padding.min}
          max={SETTINGS_LIMITS.padding.max}
          value={settings.padding}
          onChange={(event) => updateField('padding', Number(event.target.value))}
        />
        {errors.padding ? <p className="error">{errors.padding}</p> : null}
      </div>
      {notice ? <p className="muted">{notice}</p> : null}
      <div className="row">
        <button className="btn btn-primary" type="button" onClick={handleSave}>
          Speichern
        </button>
        <button className="btn btn-secondary" type="button" onClick={handleReset}>
          Auf Standard zuruecksetzen
        </button>
      </div>
    </section>
  );
}

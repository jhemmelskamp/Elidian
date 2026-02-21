import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadBlob, timestampFilename } from '../lib/download';
import { loadLogoImage } from '../lib/logo';
import { renderPostToBlob, renderPostToDataUrl } from '../lib/renderPostImage';
import { clearHistory, loadHistory, removeHistoryEntry } from '../lib/storage';
import type { HistoryItem } from '../types';

type PreviewMap = Record<string, string>;

export default function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>(() => loadHistory());
  const [previews, setPreviews] = useState<PreviewMap>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function buildPreviews(): Promise<void> {
      setError(null);
      if (items.length === 0) {
        setPreviews({});
        return;
      }
      try {
        const logoImage = await loadLogoImage();
        const pairs = await Promise.all(
          items.map(async (item) => {
            const url = await renderPostToDataUrl({
              text: item.text,
              settings: item.settingsSnapshot,
              logoImage,
            });
            return [item.id, url] as const;
          }),
        );
        if (active) {
          setPreviews(Object.fromEntries(pairs));
        }
      } catch {
        if (active) {
          setError('History-Vorschauen konnten nicht geladen werden.');
        }
      }
    }

    void buildPreviews();
    return () => {
      active = false;
    };
  }, [items]);

  function handleReuse(item: HistoryItem): void {
    navigate('/', { state: { text: item.text, settingsSnapshot: item.settingsSnapshot } });
  }

  async function handleDownload(item: HistoryItem): Promise<void> {
    try {
      const logoImage = await loadLogoImage();
      const blob = await renderPostToBlob({ text: item.text, settings: item.settingsSnapshot, logoImage });
      downloadBlob(blob, timestampFilename(item.text, 'png'));
    } catch {
      setError('Download aus der History fehlgeschlagen.');
    }
  }

  function handleDelete(id: string): void {
    setItems(removeHistoryEntry(id));
  }

  function handleClear(): void {
    clearHistory();
    setItems([]);
  }

  return (
    <section className="panel">
      <div className="row row-between">
        <h2 className="section-title">Verlauf auf diesem Geraet</h2>
        <button className="btn btn-ghost" type="button" onClick={handleClear} disabled={items.length === 0}>
          Alle loeschen
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {items.length === 0 ? <p className="muted empty-note">Noch keine Eintraege vorhanden.</p> : null}
      <div className="history-list">
        {items.map((item) => (
          <article className="history-card" key={item.id}>
            <div className="history-preview">
              {previews[item.id] ? (
                <img src={previews[item.id]} alt={`Vorschau: ${item.text.slice(0, 24)}`} />
              ) : (
                <p className="muted">Lade Vorschau...</p>
              )}
            </div>
            <div className="history-content">
              <p className="history-text">{item.text}</p>
              <p className="muted">{new Date(item.createdAt).toLocaleString('de-DE')}</p>
              <div className="row">
                <button className="btn btn-primary" type="button" onClick={() => handleReuse(item)}>
                  Erneut laden
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => void handleDownload(item)}>
                  Download
                </button>
                <button className="btn btn-danger" type="button" onClick={() => handleDelete(item.id)}>
                  Loeschen
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CanvasPreview from '../components/CanvasPreview';
import DownloadButton from '../components/DownloadButton';
import TextInputPanel from '../components/TextInputPanel';
import { downloadBlob, timestampFilename } from '../lib/download';
import { loadLogoImage } from '../lib/logo';
import { renderPostToBlob } from '../lib/renderPostImage';
import { addHistoryEntry, loadSettings, sanitizeSettings } from '../lib/storage';
import { CATEGORY_BG, type AppSettings, type PostCategory } from '../types';

type EditorState = {
  text?: string;
  settingsSnapshot?: AppSettings;
};

const DEFAULT_POST_TEXT = 'Der Ball ist rund und ein Spiel dauert 60min.';

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [text, setText] = useState(DEFAULT_POST_TEXT);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const appliedRouteStateRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (appliedRouteStateRef.current) {
      return;
    }

    const state = location.state as EditorState | null;
    if (!state || (!state.text && !state.settingsSnapshot)) {
      return;
    }

    if (state.text) {
      setText(state.text);
    }
    if (state.settingsSnapshot) {
      setSettings(sanitizeSettings(state.settingsSnapshot));
    }
    appliedRouteStateRef.current = true;
    navigate('/', { replace: true, state: null });
  }, [location.state, navigate]);

  const trimmedText = useMemo(() => text.trim(), [text]);
  const generateDisabled = trimmedText.length === 0 || isGenerating;
  const downloadDisabled = !lastBlob;

  async function generateImage(): Promise<void> {
    if (!trimmedText) {
      setError('Bitte gib einen Text ein.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const logoImage = await loadLogoImage();
      const blob = await renderPostToBlob({ text: trimmedText, settings, logoImage });
      const nextUrl = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return nextUrl;
      });
      setLastBlob(blob);
      addHistoryEntry(trimmedText, settings);
    } catch {
      setError('Das Bild konnte nicht erzeugt werden.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload(): void {
    if (!lastBlob) {
      return;
    }
    downloadBlob(lastBlob, timestampFilename(trimmedText, 'png'));
  }

  function handleCategoryChange(category: PostCategory): void {
    setSettings((prev) => ({
      ...prev,
      category,
      bgColor: CATEGORY_BG[category],
    }));
  }

  return (
    <div className="editor-grid">
      <TextInputPanel
        text={text}
        onTextChange={setText}
        category={settings.category}
        onCategoryChange={handleCategoryChange}
        onGenerate={generateImage}
        generateDisabled={generateDisabled}
        isGenerating={isGenerating}
        error={error}
      />
      <section className="panel preview-actions">
        <CanvasPreview previewUrl={previewUrl} width={settings.width} height={settings.height} />
        <DownloadButton disabled={downloadDisabled} onDownload={handleDownload} />
      </section>
    </div>
  );
}

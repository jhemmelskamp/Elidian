type CanvasPreviewProps = {
  previewUrl: string | null;
  width: number;
  height: number;
};

export default function CanvasPreview({ previewUrl, width, height }: CanvasPreviewProps) {
  return (
    <section className="panel preview-panel">
      <h2>Vorschau</h2>
      <div className="preview-frame" style={{ aspectRatio: `${width} / ${height}` }}>
        {previewUrl ? <img className="preview-image" src={previewUrl} alt="Generierte Post-Vorschau" /> : <p>Noch kein Bild erzeugt.</p>}
      </div>
      <p className="muted">
        Ausgabeformat: {width} × {height} Pixel (PNG)
      </p>
    </section>
  );
}


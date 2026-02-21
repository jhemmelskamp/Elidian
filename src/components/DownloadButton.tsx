type DownloadButtonProps = {
  disabled: boolean;
  onDownload: () => void;
};

export default function DownloadButton({ disabled, onDownload }: DownloadButtonProps) {
  return (
    <button className="btn btn-secondary" type="button" onClick={onDownload} disabled={disabled}>
      Bild herunterladen
    </button>
  );
}


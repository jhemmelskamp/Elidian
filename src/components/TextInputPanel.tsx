import type { PostCategory } from '../types';

type TextInputPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
  category: PostCategory;
  onCategoryChange: (value: PostCategory) => void;
  onGenerate: () => void;
  generateDisabled: boolean;
  isGenerating: boolean;
  error: string | null;
};

export default function TextInputPanel(props: TextInputPanelProps) {
  const { text, onTextChange, category, onCategoryChange, onGenerate, generateDisabled, isGenerating, error } = props;

  return (
    <section className="panel">
      <h2>Text eingeben</h2>
      <p className="label">Typ</p>
      <div className="category-row" role="radiogroup" aria-label="Post-Typ">
        <label className={`category-pill${category === 'aussage' ? ' active' : ''}`}>
          <input
            type="radio"
            name="post-category"
            value="aussage"
            checked={category === 'aussage'}
            onChange={() => onCategoryChange('aussage')}
          />
          Aussage
        </label>
        <label className={`category-pill${category === 'film' ? ' active' : ''}`}>
          <input
            type="radio"
            name="post-category"
            value="film"
            checked={category === 'film'}
            onChange={() => onCategoryChange('film')}
          />
          Film
        </label>
        <label className={`category-pill${category === 'zitat' ? ' active' : ''}`}>
          <input
            type="radio"
            name="post-category"
            value="zitat"
            checked={category === 'zitat'}
            onChange={() => onCategoryChange('zitat')}
          />
          Zitat
        </label>
      </div>
      <label className="label" htmlFor="post-text">
        Spruch fuer den Post
      </label>
      <textarea
        id="post-text"
        className="input textarea"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        rows={7}
        placeholder="Zum Beispiel: Weniger reden, mehr liefern."
      />
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-primary" type="button" onClick={onGenerate} disabled={generateDisabled}>
        {isGenerating ? 'Generiere...' : 'Bild generieren'}
      </button>
    </section>
  );
}


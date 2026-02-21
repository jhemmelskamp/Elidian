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
      <h2 className="section-title editor-title">Text eingeben</h2>
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
        Spruch eingeben
      </label>
      <textarea
        id="post-text"
        className="input textarea"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        rows={7}
        placeholder="Der Ball ist rund und ein Spiel dauert 60min."
      />
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-primary generate-btn" type="button" onClick={onGenerate} disabled={generateDisabled}>
        {isGenerating ? 'Generiere...' : 'Bild generieren'}
      </button>
    </section>
  );
}

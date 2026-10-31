import { STORY_DEFAULTS } from '../../lib/content';
import { ListEditor, PhotoField, StringList } from './adminBits';

// The product page story, edited with the product. Five chapters, each optional:
// a chapter with nothing in it simply isn't shown on the product page.

const EMPTY_STORY = {
  heroImages: ['', '', ''],
  lifestyle: { label: '', title: '', body: '', tags: [], word: '', image: '' },
  moments: {
    title: 'Why you’ll reach for it.',
    image: '',
    items: [
      { time: 'Morning', title: '', body: '' },
      { time: 'Through the day', title: '', body: '' },
      { time: 'Evening', title: '', body: '' },
    ],
  },
  collage: { eyebrow: '', title: '', body: '', images: ['', '', ''] },
  about: { eyebrow: '', title: '', body: '', facts: [], image: '' },
  fit: { title: 'Is it right for you?', forYou: [], goodToKnow: [], image: '' },
  promise: '',
  promiseImage: '',
};

const merge = (base, saved) => {
  if (!saved || typeof saved !== 'object') return base;
  const result = { ...base };
  Object.keys(base).forEach((key) => {
    if (saved[key] === undefined) return;
    result[key] = base[key] && typeof base[key] === 'object' && !Array.isArray(base[key]) ? merge(base[key], saved[key]) : saved[key];
  });
  return result;
};

// Start from the product's saved story, else the default text for the five Jayam products
export const storyForEditing = (product) => merge(EMPTY_STORY, product?.story || STORY_DEFAULTS[product?.slug] || null);

function Text({ label, hint, value, onChange, long, rows = 3 }) {
  return (
    <label className="ad-field">
      <span>{label}{hint && <small> — {hint}</small>}</span>
      {long
        ? <textarea rows={rows} value={value || ''} onChange={(event) => onChange(event.target.value)} />
        : <input value={value || ''} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

export default function ProductStoryEditor({ story, onChange }) {
  const set = (chapter, key) => (value) => onChange({ ...story, [chapter]: { ...story[chapter], [key]: value } });
  const setHeroImage = (index) => (value) => {
    const heroImages = [0, 1, 2].map((i) => story.heroImages?.[i] || '');
    heroImages[index] = value;
    onChange({ ...story, heroImages });
  };
  const setCollageImage = (index) => (value) => {
    const images = [0, 1, 2].map((i) => story.collage.images?.[i] || '');
    images[index] = value;
    set('collage', 'images')(images);
  };

  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <h2>Product story</h2>
        <button type="button" className="ad-link-text" onClick={() => onChange(EMPTY_STORY)}>Clear story</button>
      </div>
      <p className="ad-muted ad-small">
        The chapters under the product on its page, in this order. Each has its own photo, so the same
        picture never repeats. Leave a chapter empty to hide it; a chapter without a photo shows as text only.
        Keep the asterisk (*) on supplement benefit claims.
      </p>

      <fieldset className="ad-fieldset">
        <legend>Hero — three lifestyle photos at the top of the page</legend>
        <PhotoField label="Photo 1" hint="tall portrait, about 3:4" value={story.heroImages?.[0]} onChange={setHeroImage(0)} />
        <PhotoField label="Photo 2" hint="square, 1:1" value={story.heroImages?.[1]} onChange={setHeroImage(1)} />
        <PhotoField label="Photo 3" hint="wide landscape, about 4:3" value={story.heroImages?.[2]} onChange={setHeroImage(2)} />
      </fieldset>

      <details className="ad-chapter" open>
        <summary>1 · Lifestyle — who it’s for</summary>
        <Text label="Label" hint="small tag, e.g. “For the active man”" value={story.lifestyle.label} onChange={set('lifestyle', 'label')} />
        <Text label="Headline" value={story.lifestyle.title} onChange={set('lifestyle', 'title')} />
        <Text label="Text" value={story.lifestyle.body} onChange={set('lifestyle', 'body')} long />
        <StringList label="Lifestyle tags" items={story.lifestyle.tags} onChange={set('lifestyle', 'tags')} placeholder="e.g. Training days" addLabel="Add a tag" />
        <Text label="Large background word" hint="one word, e.g. VITALITY" value={story.lifestyle.word} onChange={set('lifestyle', 'word')} />
        <PhotoField label="Lifestyle photo" hint="the product in use; portrait works best" value={story.lifestyle.image} onChange={set('lifestyle', 'image')} />
      </details>

      <details className="ad-chapter">
        <summary>2 · A day with it</summary>
        <Text label="Heading" value={story.moments.title} onChange={set('moments', 'title')} />
        <PhotoField label="Wide photo above the timeline" hint="landscape" value={story.moments.image} onChange={set('moments', 'image')} />
        <ListEditor
          label="Moments (shown as a timeline)"
          items={story.moments.items}
          onChange={set('moments', 'items')}
          fields={[{ key: 'time', placeholder: 'When, e.g. Morning' }, { key: 'title', placeholder: 'Title' }, { key: 'body', placeholder: 'Text', long: true }]}
          addLabel="Add a moment"
        />
      </details>

      <details className="ad-chapter">
        <summary>3 · Lifestyle collage — three photos</summary>
        <p className="ad-muted ad-small">Three photos set diagonally in different shapes. It appears once at least one photo is added.</p>
        <Text label="Small heading" hint="optional" value={story.collage.eyebrow} onChange={set('collage', 'eyebrow')} />
        <Text label="Headline" hint="optional" value={story.collage.title} onChange={set('collage', 'title')} />
        <Text label="Text" hint="optional" value={story.collage.body} onChange={set('collage', 'body')} long rows={2} />
        <PhotoField label="Photo 1" hint="tall portrait, about 3:4" value={story.collage.images?.[0]} onChange={setCollageImage(0)} />
        <PhotoField label="Photo 2" hint="wide landscape, about 4:3" value={story.collage.images?.[1]} onChange={setCollageImage(1)} />
        <PhotoField label="Photo 3" hint="square, 1:1" value={story.collage.images?.[2]} onChange={setCollageImage(2)} />
      </details>

      <details className="ad-chapter">
        <summary>4 · What’s inside</summary>
        <Text label="Small heading" hint="e.g. “Meet the seed”" value={story.about.eyebrow} onChange={set('about', 'eyebrow')} />
        <Text label="Headline" value={story.about.title} onChange={set('about', 'title')} />
        <Text label="Text" value={story.about.body} onChange={set('about', 'body')} long />
        <PhotoField label="Ingredient photo" hint="e.g. the leaves, flowers or seeds" value={story.about.image} onChange={set('about', 'image')} />
        <ListEditor
          label="Big numbers"
          items={story.about.facts}
          onChange={set('about', 'facts')}
          fields={[{ key: 'value', placeholder: 'Number, e.g. 500' }, { key: 'unit', placeholder: 'Unit, e.g. mg' }, { key: 'label', placeholder: 'What it means, e.g. per capsule' }]}
          addLabel="Add a number"
        />
      </details>

      <details className="ad-chapter">
        <summary>5 · Is it right for you?</summary>
        <Text label="Heading" value={story.fit.title} onChange={set('fit', 'title')} />
        <StringList label="Made for you if…" items={story.fit.forYou} onChange={set('fit', 'forYou')} placeholder="e.g. You lead an active life" addLabel="Add a line" />
        <StringList label="Good to know" items={story.fit.goodToKnow} onChange={set('fit', 'goodToKnow')} placeholder="e.g. For adults only" addLabel="Add a line" />
        <PhotoField label="Photo beside the lists" hint="portrait" value={story.fit.image} onChange={set('fit', 'image')} />
      </details>

      <details className="ad-chapter">
        <summary>6 · Closing promise</summary>
        <Text label="Promise line" hint="the large closing sentence" value={story.promise} onChange={(value) => onChange({ ...story, promise: value })} />
        <PhotoField label="Full-width background photo" hint="landscape; the line sits over it" value={story.promiseImage} onChange={(value) => onChange({ ...story, promiseImage: value })} />
      </details>
    </section>
  );
}

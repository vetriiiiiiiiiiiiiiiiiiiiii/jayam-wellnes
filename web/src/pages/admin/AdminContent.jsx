import { useEffect, useMemo, useState } from 'react';
import { HOME_DEFAULTS, forgetContent, loadContent, mergeContent } from '../../lib/content';
import { adminApi } from '../../lib/adminApi';
import { PhotoField } from './adminBits';

// Admin → Site content: edit the storefront text without touching code.
// The form is built from the shape of the default content, so every text block
// (and any added later in lib/content.js) gets a field automatically.

const PRODUCT_NAMES = {
  'moringa-leaf-amla-tablets': 'Moringa Leaf + Amla Tablets',
  'moringa-flower-tablets': 'Moringa Flower Tablets',
  'moringa-seed-capsules': 'Moringa Seed Capsules',
  'moringa-leaf-capsules': 'Moringa Leaf Capsules',
  'beauty-drops-moringa-facial-elixir': 'Beauty Drops',
};

const LABELS = {
  hero: 'Hero — top of the home page',
  showcase: 'Product showcase',
  items: 'Product cards',
  plant: 'Our difference — four cards',
  intro: 'Intro text (right of the heading)',
  link: 'Arrow link (page path)',
  image: 'Photo URL (optional — replaces the illustration)',
  story: 'Our story teaser',
  final: 'Closing call to action',
  sealRing: 'Seal ring text',
  primaryCta: 'Main button',
  secondaryCta: 'Second link',
  cta: 'Button',
  sub: 'Supporting line',
  accent: 'Accent words (second colour)',
  headline: 'Headline',
  subtitle: 'Product line',
  badge: 'Badge',
  lifestyle: '1 · Lifestyle — who it is for',
  moments: '2 · Why you’ll reach for it',
  about: '3 · What’s inside',
  fit: '4 · Is it right for you?',
  promise: '5 · Closing promise',
  word: 'Large background word',
  tags: 'Lifestyle tags',
  forYou: 'Made for you if…',
  goodToKnow: 'Good to know',
  facts: 'Numbers',
  steps: 'Steps',
  time: 'Moment',
  ...PRODUCT_NAMES,
};

const LONG_FIELDS = ['body', 'description', 'sub'];

const humanize = (key) => LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const blankLike = (template) => {
  if (Array.isArray(template)) return [];
  if (isObject(template)) return Object.fromEntries(Object.keys(template).map((key) => [key, blankLike(template[key])]));
  return '';
};

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-forest-700 focus:outline-none';

function Field({ name, template, value, onChange, depth }) {
  if (Array.isArray(template)) {
    const itemTemplate = template[0] ?? '';
    const items = Array.isArray(value) ? value : [];
    return (
      <fieldset className="rounded-xl border border-gray-200 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">{humanize(name)}</legend>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Field
                  name={`${humanize(name)} ${index + 1}`}
                  template={itemTemplate}
                  value={item}
                  depth={depth + 1}
                  onChange={(next) => onChange(items.map((current, i) => (i === index ? next : current)))}
                />
              </div>
              <button type="button" className="self-start rounded-lg px-2 py-2 text-xs text-red-600 hover:bg-red-50" onClick={() => onChange(items.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50" onClick={() => onChange([...items, blankLike(itemTemplate)])}>
          + Add
        </button>
      </fieldset>
    );
  }

  if (isObject(template)) {
    const current = isObject(value) ? value : {};
    const fields = (
      <div className="space-y-3">
        {Object.keys(template).map((key) => (
          <Field
            key={key}
            name={key}
            template={template[key]}
            value={current[key]}
            depth={depth + 1}
            onChange={(next) => onChange({ ...current, [key]: next })}
          />
        ))}
      </div>
    );
    if (depth === 0) return fields;
    return (
      <fieldset className="rounded-xl border border-gray-200 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">{humanize(name)}</legend>
        {fields}
      </fieldset>
    );
  }

  const text = typeof value === 'string' ? value : '';
  if (name === 'image') return <PhotoField hint="leave empty to show the illustration" value={text} onChange={onChange} />;
  const long = LONG_FIELDS.includes(name) || String(template).length > 80;
  return (
    <label className="block text-xs font-medium text-gray-600">
      {humanize(name)}
      {long
        ? <textarea className={`${inputClass} mt-1`} rows={3} value={text} onChange={(event) => onChange(event.target.value)} />
        : <input className={`${inputClass} mt-1`} value={text} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

const TABS = [
  { key: 'home', label: 'Home page', defaults: HOME_DEFAULTS },
];

export default function AdminContent() {
  const [tab, setTab] = useState('home');
  const [values, setValues] = useState({});
  const [section, setSection] = useState('hero');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    TABS.forEach(({ key, defaults }) => {
      loadContent(key, { fresh: true }).then((saved) => {
        setValues((current) => ({ ...current, [key]: mergeContent(defaults, saved) }));
      });
    });
  }, []);

  const active = TABS.find((item) => item.key === tab);
  const sections = useMemo(() => Object.keys(active.defaults), [active]);
  const value = values[tab];

  const switchTab = (key) => {
    setTab(key);
    setSection(Object.keys(TABS.find((item) => item.key === key).defaults)[0]);
    setStatus('');
  };

  const updateSection = (next) => {
    setValues((current) => ({ ...current, [tab]: { ...current[tab], [section]: next } }));
    setStatus('Unsaved changes');
  };

  const resetSection = () => {
    updateSection(structuredClone(active.defaults[section]));
  };

  const save = async () => {
    setSaving(true);
    const result = await adminApi.saveContent(tab, value);
    setSaving(false);
    if (result.ok) {
      forgetContent(tab);
      setStatus(`Saved ${new Date(result.data.updatedAt).toLocaleTimeString()}`);
    } else {
      setStatus(result.message);
    }
  };

  if (!value) return <p className="ad-muted">Loading content…</p>;

  return (
    <div className="ad-page">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-gray-900">Site content</h1>
            <p className="mt-1 text-sm text-gray-500">Edit the words on the home page. Changes go live as soon as you save. Product stories are edited with each product, under Products.</p>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-sm text-gray-500" role="status">{status}</span>}
            <button type="button" onClick={save} disabled={saving} className="rounded-full bg-brand-forest-700 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => switchTab(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${tab === item.key ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          <ul className="w-56 flex-shrink-0 space-y-1">
            {sections.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setSection(key)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${section === key ? 'bg-brand-green-100 font-semibold text-brand-dark' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {humanize(key)}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex-1 rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{humanize(section)}</h2>
              <button type="button" onClick={resetSection} className="text-xs text-gray-500 underline hover:text-gray-800">
                Restore default text
              </button>
            </div>
            <Field
              name={section}
              template={active.defaults[section]}
              value={value[section]}
              depth={0}
              onChange={updateSection}
            />
            <p className="mt-6 text-xs text-gray-500">
              Benefit lines on supplements should keep their asterisk (*), which links them to the FDA statement in the footer.
            </p>
          </div>
        </div>
    </div>
  );
}

import BotanicalIllustration from './BotanicalIllustration';
import { Plate, Chip } from './UI';
import { RARITIES, HABITATS, CATEGORIES, isEmpty, hashSeed } from '../lib/utils';

const FACTS = [['habitat', 'Habitat', true], ['bloomCycle', 'Bloom cycle', true], ['appearance', 'Appearance', true], ['roots', 'Roots'], ['leaves', 'Leaves'], ['fragrance', 'Fragrance'], ['seasonal', 'Seasonal behaviour']];
const Missing = () => <span className="font-hand missing">not yet recorded</span>;

export default function SpecimenSheet({ plant: p, editing = false, onChange }) {
  const set = (k, v) => onChange({ ...p, [k]: v });
  const text = (k, area) => editing
    ? (area ? <textarea className="input" rows={3} value={p[k] || ''} onChange={(e) => set(k, e.target.value)} aria-label={k} />
            : <input className="input" value={p[k] || ''} onChange={(e) => set(k, e.target.value)} aria-label={k} />)
    : isEmpty(p[k]) ? <Missing /> : p[k];
  return (
    <article className="sheet frame">
      <div className="sheet-art">
        <Plate tone={(hashSeed(p.id) % 4) + 1}><BotanicalIllustration kind={p.kind} palette={p.palette} seed={p.id} label={`Illustration of ${p.common || p.scientific}`} /></Plate>
        <div className="specimen-label">
          <span className="font-ui">Specimen {p.no || '—'}</span>
          <strong className="font-display">{p.scientific || 'Unnamed'}</strong>
          <span className="stamp font-ui">Fictional species</span>
        </div>
        {p.annotation && <p className="font-hand annot">{p.annotation}</p>}
      </div>
      <div className="sheet-body">
        <p className="kicker-ui font-ui">Plant record · fictional, not a botanical fact</p>
        <h1 className="font-display sci-h">{editing ? text('scientific') : p.scientific}</h1>
        <h2 className="font-head common-h">{editing ? text('common') : p.common || <Missing />}</h2>
        <div className="chips">
          {editing ? (
            <>
              <select className="input" value={p.rarity} onChange={(e) => set('rarity', e.target.value)} aria-label="Rarity">{RARITIES.map((r) => <option key={r}>{r}</option>)}</select>
              <select className="input" value={p.category} onChange={(e) => set('category', e.target.value)} aria-label="Category">{CATEGORIES.map((r) => <option key={r}>{r}</option>)}</select>
            </>
          ) : (<><Chip>{p.rarity}</Chip><Chip>{p.category}</Chip></>)}
        </div>
        <p className="lede">{text('description', true)}</p>
        <dl className="facts">
          {FACTS.filter(([k, , req]) => editing || req || !isEmpty(p[k])).map(([k, l]) => (
            <div key={k}><dt className="font-ui">{l}</dt><dd>{k === 'habitat' && editing
              ? <input className="input" list="habitats" value={p.habitat || ''} onChange={(e) => set('habitat', e.target.value)} aria-label="Habitat" />
              : text(k, k === 'appearance')}</dd></div>
          ))}
        </dl>
        {editing && <datalist id="habitats">{HABITATS.map((h) => <option key={h} value={h} />)}</datalist>}
        <h3 className="font-head">Properties</h3>
        {editing
          ? <textarea className="input" rows={3} placeholder="One property per line" value={(p.properties || []).join('\n')} onChange={(e) => set('properties', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} aria-label="Properties" />
          : isEmpty(p.properties) ? <Missing /> : <ul className="props">{p.properties.map((x) => <li key={x}>{x}</li>)}</ul>}
        <h3 className="font-head">Folklore</h3>
        <blockquote className="folklore">{text('folklore', true)}</blockquote>
        {editing && <input className="input" placeholder="Tags, comma separated" value={(p.tags || []).join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} aria-label="Tags" />}
        {!editing && !!p.tags?.length && <div className="chips">{p.tags.map((t) => <Chip key={t}>#{t}</Chip>)}</div>}
      </div>
    </article>
  );
}

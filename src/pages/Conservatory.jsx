import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { usePlants } from '../lib/store';
import BotanicalCard from '../components/BotanicalCard';
import { PageHeader, Select } from '../components/UI';
import { RARITIES, CATEGORIES, isIncomplete } from '../lib/utils';

export default function Conservatory() {
  const { plants, mark } = usePlants();
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const [f, setF] = useState({ rarity: '', habitat: '', category: '', fav: false });
  const done = plants.filter((p) => !isIncomplete(p));
  const habitats = [...new Set(done.map((p) => p.habitat).filter(Boolean))].sort();
  const list = useMemo(() => done.filter((p) => {
    const hay = [p.scientific, p.common, p.habitat, ...(p.tags || [])].join(' ').toLowerCase();
    return (!q || hay.includes(q.toLowerCase())) && (!f.rarity || p.rarity === f.rarity) && (!f.habitat || p.habitat === f.habitat) && (!f.category || p.category === f.category) && (!f.fav || mark(p.id).favorite);
    // eslint-disable-next-line
  }), [done, q, f, mark]);
  return (
    <section className="page">
      <PageHeader kicker="Specimens, pressed and catalogued" title="The Conservatory" />
      <div className="filters">
        <label className="field search"><span className="field-label">Search</span>
          <span className="input with-icon"><Search size={16} /><input value={q} onChange={(e) => setSp(e.target.value ? { q: e.target.value } : {})} placeholder="Name, habitat or tag" aria-label="Search plants" /></span>
        </label>
        <Select label="Rarity" value={f.rarity} onChange={(v) => setF({ ...f, rarity: v })} options={RARITIES} />
        <Select label="Habitat" value={f.habitat} onChange={(v) => setF({ ...f, habitat: v })} options={habitats} />
        <Select label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={CATEGORIES} />
        <label className="check"><input type="checkbox" checked={f.fav} onChange={(e) => setF({ ...f, fav: e.target.checked })} /> Favourites</label>
      </div>
      {list.length ? <div className="grid">{list.map((p) => <BotanicalCard key={p.id} plant={p} />)}</div> : <p className="empty font-hand">No specimens match. Try loosening the filters.</p>}
    </section>
  );
}

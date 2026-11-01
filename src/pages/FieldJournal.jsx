import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlants } from '../lib/store';
import BotanicalIllustration from '../components/BotanicalIllustration';
import { Notes, PageHeader } from '../components/UI';
import { BackupControls } from '../components/Navigation';
import { SAMPLES } from '../data/samplePlants';

const TABS = [['journal', 'My journal'], ['fav', 'Favourites'], ['mine', 'My discoveries']];

export default function FieldJournal() {
  const { plants, marks, setMark } = usePlants();
  const [tab, setTab] = useState('journal');
  const list = plants.filter((p) => tab === 'journal' ? marks[p.id]?.journal : tab === 'fav' ? marks[p.id]?.favorite : !SAMPLES.some((s) => s.id === p.id));
  return (
    <section className="page wide">
      <PageHeader kicker="Notes in the margins" title="The Field Journal" />
      <div className="backup-box frame"><h3 className="font-head">Back up your collection</h3><BackupControls /></div>
      <div className="tabs" role="tablist">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {list.length === 0 && <p className="empty font-hand">{tab === 'mine' ? 'Nothing discovered yet. Visit the Discovery Desk.' : 'Nothing here yet. Save a specimen from the Conservatory.'}</p>}
      <div className="journal">
        {list.map((p) => (
          <article key={p.id} className="leaf-page frame">
            <i className="tape" aria-hidden />
            <Link to={`/plant/${p.id}`} className="jl"><div className="jart"><BotanicalIllustration kind={p.kind} palette={p.palette} seed={p.id} label="" /></div>
              <h3 className="font-display">{p.scientific}</h3><p className="font-head">{p.common || 'Unnamed'}</p></Link>
            <Notes id={p.id} />
            <button className="link-btn" onClick={() => setMark(p.id, { journal: !marks[p.id]?.journal })}>{marks[p.id]?.journal ? 'Remove from journal' : 'Add to journal'}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

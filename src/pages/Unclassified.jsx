import { Link } from 'react-router-dom';
import { usePlants } from '../lib/store';
import BotanicalIllustration from '../components/BotanicalIllustration';
import { Chip, PageHeader } from '../components/UI';
import { isIncomplete, missingFields, LABELS } from '../lib/utils';

export default function Unclassified() {
  const { plants } = usePlants();
  const list = plants.filter(isIncomplete);
  return (
    <section className="page">
      <PageHeader kicker="Records with gaps" title="The Unclassified" />
      {list.length === 0 && <p className="empty font-hand">Every record is complete. The mystery is gone.</p>}
      <div className="grid">
        {list.map((p) => (
          <Link key={p.id} to={`/plant/${p.id}?complete=1`} className="unclass frame">
            <div className="smudge"><BotanicalIllustration kind={p.kind} palette={p.palette} seed={p.id} label="" /></div>
            <h3 className="font-display">{p.scientific}</h3>
            <p className="font-hand annot">{p.annotation}</p>
            <div className="chips">{missingFields(p).map((k) => <Chip key={k} tone="warn">{LABELS[k]}?</Chip>)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Heart, BookMarked, Pencil, Check, Trash2 } from 'lucide-react';
import { usePlants } from '../lib/store';
import SpecimenSheet from '../components/SpecimenSheet';
import { Button, Notes } from '../components/UI';
import { SAMPLES } from '../data/samplePlants';

export default function PlantDetails() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { plants, mark, setMark, savePlant, removePlant } = usePlants();
  const plant = plants.find((p) => p.id === id);
  const [editing, setEditing] = useState(sp.get('complete') === '1');
  const [draft, setDraft] = useState(plant);
  useEffect(() => { setDraft(plant); }, [plant]);
  if (!plant) return <section className="page"><h1 className="font-display">Specimen not found</h1><Link className="btn" to="/conservatory">Back to the Conservatory</Link></section>;
  const m = mark(id);
  const isSample = SAMPLES.some((s) => s.id === id);
  return (
    <section className="page wide">
      <div className="actions">
        <Button variant="ghost" onClick={() => setMark(id, { favorite: !m.favorite })} aria-pressed={m.favorite}><Heart size={16} fill={m.favorite ? 'currentColor' : 'none'} /> {m.favorite ? 'Favourited' : 'Favourite'}</Button>
        <Button variant="ghost" onClick={() => setMark(id, { journal: !m.journal })} aria-pressed={m.journal}><BookMarked size={16} /> {m.journal ? 'In your journal' : 'Save to journal'}</Button>
        {editing
          ? <><Button onClick={() => { savePlant(draft); setEditing(false); }}><Check size={16} /> Save record</Button><Button variant="ghost" onClick={() => { setDraft(plant); setEditing(false); }}>Cancel</Button></>
          : <Button variant="ghost" onClick={() => setEditing(true)}><Pencil size={16} /> {plant.unclassified ? 'Complete record' : 'Edit'}</Button>}
        {!isSample && <Button variant="ghost" onClick={() => { if (confirm('Delete this specimen from your herbarium?')) { removePlant(id); nav('/conservatory'); } }}><Trash2 size={16} /> Delete</Button>}
      </div>
      <SpecimenSheet plant={editing ? draft : plant} editing={editing} onChange={setDraft} />
      <Notes id={id} />
    </section>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, RefreshCw, Save, Trash2, Pencil, Check, AlertTriangle } from 'lucide-react';
import { usePlants } from '../lib/store';
import { loadModel, generatePlant, hasWebGPU } from '../lib/ai';
import { composePlant } from '../lib/composer';
import { MODELS, COMPOSER } from '../lib/models';
import { HABITATS, MOODS, RARITIES, CATEGORIES, LABELS } from '../lib/utils';
import SpecimenSheet from '../components/SpecimenSheet';
import { Button, Dropdown, Field, PageHeader, Select } from '../components/UI';

export default function DiscoveryDesk() {
  const { savePlant, setMark } = usePlants();
  const nav = useNavigate();
  const [f, setF] = useState({ seed: '', habitat: '', mood: '', rarity: '', type: '' });
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [st, setSt] = useState({ phase: 'idle' });
  const [pct, setPct] = useState(0);
  const [stream, setStream] = useState('');
  const [plant, setPlant] = useState(null);
  const [editing, setEditing] = useState(false);
  const busy = st.phase === 'loading' || st.phase === 'generating';
  const up = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const run = async () => {
    if (!f.seed.trim() && !f.habitat && !f.mood && !f.type) return setSt({ phase: 'error', message: 'Offer a seed word, or choose at least one attribute.' });
    setPlant(null); setEditing(false); setStream(''); setPct(0);
    if (modelId === COMPOSER) { setPlant(composePlant(f)); return setSt({ phase: 'done', device: 'composer' }); }
    try {
      setSt({ phase: 'loading' });
      const device = await loadModel(modelId, setPct);
      setSt({ phase: 'generating', device });
      const rec = await generatePlant(f, { onToken: (t) => setStream((s) => s + t) });
      setPlant(rec); setSt({ phase: 'done', device });
    } catch (e) {
      // One honest outcome: the built-in composer finishes the job and says so.
      setPlant(composePlant(f, { reason: e.message || 'Unknown error' }));
      setModelId(COMPOSER);
      setSt({ phase: 'done', device: 'composer' });
    }
  };
  const save = async () => { await savePlant(plant); await setMark(plant.id, { journal: true }); nav(`/plant/${plant.id}`); };
  const discard = () => { setPlant(null); setEditing(false); setStream(''); setSt({ phase: 'idle' }); };

  return (
    <section className="page wide">
      <PageHeader kicker="Plant a thought, see what grows" title="The Discovery Desk" />
      <div className="desk">
        <form className="desk-form frame" onSubmit={(e) => { e.preventDefault(); run(); }}>
          <Field label="Seed word"><input className="input" value={f.seed} onChange={(e) => up('seed')(e.target.value)} placeholder="forgotten, moonlight, longing, silence, rain" maxLength={40} /></Field>
          <Select label="Habitat" value={f.habitat} onChange={up('habitat')} options={HABITATS} />
          <Select label="Mood" value={f.mood} onChange={up('mood')} options={MOODS} />
          <Select label="Rarity" value={f.rarity} onChange={up('rarity')} options={RARITIES} />
          <Select label="Plant type" value={f.type} onChange={up('type')} options={CATEGORIES} />
          <div className="field">
            <span className="field-label">Writer</span>
            <Dropdown label="Writer" value={modelId} onChange={setModelId} disabled={busy}
              options={MODELS.map((m) => ({ value: m.id, label: `${m.label} (${m.size})` }))} />
          </div>
          <Button type="submit" disabled={busy}><Sprout size={16} /> {busy ? 'Imagining…' : plant ? 'Imagine another' : 'Imagine a plant'}</Button>
          <p className="small">AI models run in your browser. {hasWebGPU() ? 'WebGPU detected.' : 'No WebGPU found, so the slower WebAssembly mode will be used.'} The first run downloads the model and caches it. If a model cannot run on this device, the built-in composer finishes the specimen.</p>
        </form>

        <div className="desk-out">
          {st.phase === 'idle' && !plant && <p className="empty font-hand">Your specimen will appear here.</p>}
          {st.phase === 'loading' && (
            <div className="status" role="status"><h3 className="font-head">Preparing the model</h3>
              <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
              <p className="font-hand">{pct > 0 ? `${Math.round(pct)}% fetched` : 'Starting up…'} Later visits use the cached copy.</p></div>
          )}
          {st.phase === 'generating' && (
            <div className="status" role="status"><h3 className="font-head">Drawing up the record ({st.device})</h3>
              <pre className="stream font-hand">{stream || 'Thinking…'}</pre></div>
          )}
          {st.phase === 'error' && (
            <div className="status error" role="alert"><h3 className="font-head"><AlertTriangle size={18} /> Nothing to plant yet</h3><p>{st.message}</p></div>
          )}
          {plant && st.phase === 'done' && (
            <>
              {plant.source === 'composer' && (
                <p className="small" role="note">
                  {plant.fallbackReason
                    ? 'The AI model could not run on this device, so this specimen was composed by the herbarium’s built-in generator. Pick a model again if you want to retry the AI.'
                    : 'Composed by the built-in generator, with no AI model. Pick a model above for AI-written text.'}
                </p>
              )}
              {plant.fallbackReason && <details><summary className="small">Technical details</summary><pre className="stream font-hand">{plant.fallbackReason}</pre></details>}
              {plant.source === 'ai' && plant.filled?.length > 0 && (
                <p className="small" role="note">
                  The model wrote {plant.aiWrote} of 8 fields. The rest ({plant.filled.map((k) => LABELS[k]?.toLowerCase()).join(', ')}) were filled in from your choices. Edit anything you like.
                </p>
              )}
              <div className="actions">
                <Button onClick={save}><Save size={16} /> Save to journal</Button>
                <Button variant="ghost" onClick={run}><RefreshCw size={16} /> Regenerate</Button>
                <Button variant="ghost" onClick={() => setEditing(!editing)}>{editing ? <><Check size={16} /> Done</> : <><Pencil size={16} /> Edit</>}</Button>
                <Button variant="ghost" onClick={discard}><Trash2 size={16} /> Discard</Button>
              </div>
              <SpecimenSheet plant={plant} editing={editing} onChange={setPlant} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

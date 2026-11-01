import { useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Settings, Leaf, Menu, X, Download, Upload } from 'lucide-react';
import { Modal, Button } from './UI';
import { usePlants } from '../lib/store';
import { downloadJson } from '../lib/utils';

const LINKS = [['/', 'Home'], ['/conservatory', 'The Conservatory'], ['/discovery-desk', 'Discovery Desk'], ['/field-journal', 'Field Journal'], ['/unclassified', 'Unclassified']];

export function BackupControls() {
  const { exportData, importData } = usePlants();
  const file = useRef();
  const [msg, setMsg] = useState('');
  const doExport = async () => { try { downloadJson(`digital-herbarium-${new Date().toISOString().slice(0, 10)}.json`, await exportData()); setMsg('Backup downloaded.'); } catch (e) { setMsg(e.message); } };
  const doImport = async (e) => { const f = e.target.files[0]; if (!f) return; try { await importData(await f.text()); setMsg('Backup restored.'); } catch (err) { setMsg(err.message || 'Could not read that file.'); } e.target.value = ''; };
  return (
    <div className="backup">
      <div className="row">
        <Button variant="ghost" onClick={doExport}><Download size={16} /> Export backup</Button>
        <Button variant="ghost" onClick={() => file.current.click()}><Upload size={16} /> Import backup</Button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={doImport} />
      </div>
      {msg && <p role="status" className="font-hand">{msg}</p>}
      <p className="small">Your collection is stored in this browser profile on this device. Export a backup before clearing site data or switching devices.</p>
    </div>
  );
}

export default function Navigation() {
  const { settings, updateSettings } = usePlants();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false), [search, setSearch] = useState(false), [q, setQ] = useState('');
  const go = (e) => { e.preventDefault(); setSearch(false); nav(`/conservatory?q=${encodeURIComponent(q)}`); };
  return (
    <header className="nav">
      <Link to="/" className="brand" aria-label="The Digital Herbarium, home">
        <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden><g fill="none" stroke="var(--ink)" strokeWidth="1.2"><path d="M20 36V18"/><ellipse cx="20" cy="11" rx="3.5" ry="8"/><ellipse cx="20" cy="11" rx="3.5" ry="8" transform="rotate(55 20 18)"/><ellipse cx="20" cy="11" rx="3.5" ry="8" transform="rotate(-55 20 18)"/><path d="M20 30c-6 0-9-3-10-6 6 0 9 2 10 6zM20 27c5 0 8-2 9-6-5 0-8 2-9 6z"/></g></svg>
        <span><small className="font-ui">THE DIGITAL</small><b className="font-display">HERBARIUM</b></span>
      </Link>
      <nav className="links" aria-label="Primary">
        {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>)}
      </nav>
      <div className="tools">
        <button className="icon-btn" aria-label="Search" onClick={() => setSearch(true)}><Search size={18} /></button>
        <NavLink to="/settings" className="icon-btn" aria-label="Settings"><Settings size={18} /></NavLink>
        <button className="icon-btn" aria-label="Cycle theme" onClick={() => updateSettings({ theme: { conservatory: 'midnight', midnight: 'fieldnotes', fieldnotes: 'conservatory' }[settings.theme || 'conservatory'] })}><Leaf size={18} /></button>
        <button className="icon-btn burger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menu && <nav className="mobile-menu" aria-label="Mobile">{LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenu(false)}>{label}</NavLink>)}</nav>}
      <Modal open={search} onClose={() => setSearch(false)} title="Search the Conservatory">
        <form onSubmit={go} className="search-form"><input autoFocus className="input" placeholder="Botanical name, common name, habitat or tag" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" /><Button type="submit">Search</Button></form>
      </Modal>
    </header>
  );
}

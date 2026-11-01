import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SAMPLES } from '../data/samplePlants';
import * as db from './db';

const Ctx = createContext(null);
export const usePlants = () => useContext(Ctx);
const blank = (id) => ({ id, favorite: false, journal: false, notes: [] });

export function PlantsProvider({ children }) {
  const [records, setRecords] = useState({});
  const [marks, setMarks] = useState({});
  const [settings, setSettings] = useState({ key: 'app', theme: null });
  const [ready, setReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  const load = () =>
    db.loadAll().then(({ plants, marks, settings }) => {
      setRecords(Object.fromEntries(plants.map((p) => [p.id, p])));
      setMarks(Object.fromEntries(marks.map((m) => [m.id, m])));
      if (settings) setSettings(settings);
    });

  useEffect(() => {
    load().catch((e) => setDbError(e.message)).finally(() => setReady(true));
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = settings.theme || 'conservatory'; }, [settings.theme]);

  const guard = (p) => p.catch((e) => setDbError(e.message || 'Could not save to this browser.'));
  const plants = useMemo(() => {
    const user = Object.values(records).filter((r) => !SAMPLES.some((s) => s.id === r.id)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return [...user, ...SAMPLES.map((s) => records[s.id] || s)];
  }, [records]);

  const value = {
    ready, dbError, plants, marks, settings,
    mark: (id) => marks[id] || blank(id),
    savePlant: (p) => { setRecords((r) => ({ ...r, [p.id]: p })); return guard(db.put('plants', p)); },
    removePlant: (id) => { setRecords((r) => { const n = { ...r }; delete n[id]; return n; }); return guard(db.del('plants', id)); },
    setMark: (id, patch) => {
      const next = { ...blank(id), ...marks[id], ...patch };
      setMarks((m) => ({ ...m, [id]: next }));
      return guard(db.put('marks', next));
    },
    updateSettings: (patch) => { const next = { ...settings, ...patch, key: 'app' }; setSettings(next); return guard(db.put('settings', next)); },
    exportData: () => db.exportAll(),
    importData: async (text) => { await db.importAll(JSON.parse(text)); await load(); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

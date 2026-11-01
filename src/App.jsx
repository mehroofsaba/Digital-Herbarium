import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { PlantsProvider, usePlants } from './lib/store';
import Navigation from './components/Navigation';
import LeafCursor from './components/LeafCursor';
import { Modal, ThemePicker } from './components/UI';
import Landing from './pages/Landing';
import Conservatory from './pages/Conservatory';
import DiscoveryDesk from './pages/DiscoveryDesk';
import FieldJournal from './pages/FieldJournal';
import Unclassified from './pages/Unclassified';
import PlantDetails from './pages/PlantDetails';
import Settings from './pages/Settings';

function Shell() {
  const loc = useLocation();
  const { ready, settings, updateSettings } = usePlants();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Navigation />
      <AnimatePresence mode="wait">
        <motion.main id="main" key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Routes location={loc}>
            <Route path="/" element={<Landing />} />
            <Route path="/conservatory" element={<Conservatory />} />
            <Route path="/discovery-desk" element={<DiscoveryDesk />} />
            <Route path="/field-journal" element={<FieldJournal />} />
            <Route path="/unclassified" element={<Unclassified />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/plant/:id" element={<PlantDetails />} />
            <Route path="*" element={<section className="page"><h1 className="font-display">Page not found</h1><p>This page has not been catalogued.</p></section>} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <footer className="footer font-ui">Every species in this herbarium is fictional.</footer>
      <Modal open={ready && !settings.theme} title="Choose the botanical world">
        <ThemePicker value={null} onPick={(t) => updateSettings({ theme: t })} />
      </Modal>
      <LeafCursor />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <PlantsProvider><Shell /></PlantsProvider>
    </MotionConfig>
  );
}

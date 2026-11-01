import { motion } from 'motion/react';
import BotanicalIllustration from '../components/BotanicalIllustration';
import { Foliage, BookStack, Vase, Particles, LedgeLeaves } from '../components/Decor';

export default function Landing() {
  return (
    <section className="hero">
      <Foliage seed={3} className="fol-l" />
      <Foliage seed={7} flip className="fol-r" />
      <Particles />
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow font-display"><span />An illustrated field guide to</p>
          <h1 className="font-display">Imaginary<br />Plants</h1>
          <p className="font-hand cover-note">Some things are not meant to be real.</p>
        </div>
        <motion.div className="hero-art" initial={{ rotate: 6, opacity: 0 }} animate={{ rotate: 3, opacity: 1 }} whileHover={{ rotate: 1.5 }} transition={{ duration: 1 }}>
          <div className="book">
            <div className="page-left font-hand" aria-hidden>
              <p>Found where the marsh meets moonlight, petals opening only to the cold.</p>
              <p>Roots thread the water like lace. Do not pick.</p>
              <p>Notes: third night, no wind.</p>
            </div>
            <div className="page-right" aria-hidden>{[...Array(6)].map((_, i) => <i key={i} style={{ opacity: 0.3 + i * 0.1 }} />)}</div>
            <BotanicalIllustration kind="root" palette="lavender" seed="lunaria-aetheris" className="book-flower" label="Illustration of Lunaria aetheris" />
            <div className="tag font-hand">Lunaria aetheris<small>fig. 1</small></div>
          </div>
          <BotanicalIllustration kind="flower" palette="terracotta" seed="pressed" className="pressed" label="" />
          <div className="sketch-card"><BotanicalIllustration kind="fern" seed="sk" label="" /></div>
        </motion.div>
      </div>
      <div className="ledge" aria-hidden />
      <BookStack className="books" /><LedgeLeaves className="ledge-leaves" /><Vase className="vase" />
    </section>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import BotanicalIllustration from './BotanicalIllustration';
import { Plate, Chip } from './UI';
import { usePlants } from '../lib/store';
import { hashSeed, missingFields, isIncomplete } from '../lib/utils';

export default function BotanicalCard({ plant: p }) {
  const { mark, setMark } = usePlants();
  const fav = mark(p.id).favorite;
  const missing = isIncomplete(p) ? missingFields(p).length : 0;
  return (
    <motion.article className="b-card frame" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
      <button className="fav" aria-pressed={fav} aria-label={fav ? 'Remove from favourites' : 'Add to favourites'} onClick={() => setMark(p.id, { favorite: !fav })}>
        <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
      </button>
      <Link to={`/plant/${p.id}`} className="b-card-link">
        <Plate tone={(hashSeed(p.id) % 4) + 1}>
          <motion.div whileHover={{ rotate: 2, scale: 1.04 }}><BotanicalIllustration kind={p.kind} palette={p.palette} seed={p.id} label={`Illustration of ${p.common || p.scientific}`} /></motion.div>
        </Plate>
        <h3 className="font-display sci">{p.scientific}</h3>
        <p className="font-head common">{p.common || 'Unnamed'}</p>
        <div className="chips">
          <Chip>{p.rarity}</Chip>
          {missing > 0 && <Chip tone="warn">{missing} missing</Chip>}
        </div>
      </Link>
    </motion.article>
  );
}

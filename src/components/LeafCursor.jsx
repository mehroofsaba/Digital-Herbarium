import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

const INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,summary';

export default function LeafCursor() {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState(false);
  const [drops, setDrops] = useState([]);
  const reduce = useReducedMotion();
  const x = useMotionValue(-80), y = useMotionValue(-80), rot = useMotionValue(-20);
  const sx = useSpring(x, { stiffness: 1200, damping: 70, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 1200, damping: 70, mass: 0.2 });
  const sr = useSpring(rot, { stiffness: 220, damping: 14 });
  const last = useRef(0), timer = useRef();

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const upd = () => setOn(mq.matches);
    upd(); mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  useEffect(() => {
    if (!on) return;
    document.documentElement.classList.add('leaf-cursor-on');
    const move = (e) => {
      x.set(e.clientX); y.set(e.clientY);
      if (!reduce) {
        const dx = e.clientX - last.current;
        rot.set(-20 + Math.max(-35, Math.min(35, dx * 1.6)));
        clearTimeout(timer.current);
        timer.current = setTimeout(() => rot.set(-20), 120);
      }
      last.current = e.clientX;
      setHover(!!e.target.closest?.(INTERACTIVE));
    };
    const down = (e) => {
      if (reduce || !e.target.closest?.(INTERACTIVE)) return;
      const id = performance.now();
      setDrops((d) => [...d.slice(-4), { id, x: e.clientX, y: e.clientY, dx: (Math.random() - 0.5) * 70 }]);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    return () => {
      document.documentElement.classList.remove('leaf-cursor-on');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
    };
  }, [on, reduce, x, y, rot]);

  if (!on) return null;
  return (
    <>
      <motion.div className="leaf-cursor" style={{ x: sx, y: sy, rotate: sr }} aria-hidden>
        <motion.svg width="26" height="26" viewBox="0 0 26 26" animate={hover && !reduce ? { scale: 1.3, rotate: [0, -10, 8, -4, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.7 }}>
          <path d="M2 2C12 0 24 8 23 22C10 24 1 14 2 2Z" style={{ fill: "var(--leafc)", stroke: "var(--ink)" }} strokeWidth="1" />
          <path d="M3 3L20 19M10 9L14 8M13 13L18 11M7 6L6 10" style={{ stroke: "var(--paper)", fill: "none" }} strokeWidth=".9" />
        </motion.svg>
      </motion.div>
      {drops.map((d) => (
        <motion.svg key={d.id} className="leaf-drop" width="14" height="14" viewBox="0 0 26 26" style={{ left: d.x, top: d.y }} initial={{ opacity: 0.9, x: 0, y: 0, rotate: 0 }} animate={{ opacity: 0, x: d.dx, y: 56, rotate: d.dx * 4 }} transition={{ duration: 1.1, ease: 'easeOut' }} onAnimationComplete={() => setDrops((a) => a.filter((q) => q.id !== d.id))} aria-hidden>
          <path d="M2 2C12 0 24 8 23 22C10 24 1 14 2 2Z" style={{ fill: "var(--leafc)" }} />
        </motion.svg>
      ))}
    </>
  );
}

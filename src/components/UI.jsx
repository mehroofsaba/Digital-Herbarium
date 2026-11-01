import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronDown, Check } from "lucide-react";
import { usePlants } from "../lib/store";
import BotanicalIllustration from "./BotanicalIllustration";

export const Button = ({ variant = "solid", className = "", ...p }) => (
  <button
    className={`btn ${variant === "ghost" ? "btn-ghost" : ""} ${className}`}
    {...p}
  />
);
export const Chip = ({ children, tone }) => (
  <span className="chip" data-tone={tone}>
    {children}
  </span>
);
export const Plate = ({ tone = 1, className = "", children }) => (
  <div className={`plate ${className}`} data-tone={tone}>
    {children}
  </div>
);

export function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

/* Custom themed dropdown (replaces the browser's native <select> list).
   options: array of strings, or { value, label } objects.
   any: label for an empty "no filter" entry (e.g. "Any"). */
export function Dropdown({ value, onChange, options, any, label, disabled }) {
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  const all = any !== undefined ? [{ value: "", label: any }, ...items] : items;
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const root = useRef(null);
  const sel = all.find((o) => o.value === value) || all[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const openList = () => {
    setHi(Math.max(0, all.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (o) => {
    onChange(o.value);
    setOpen(false);
  };
  const onKey = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => Math.min(all.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(all[hi]);
    }
  };

  return (
    <div className="dd" ref={root}>
      <button
        type="button"
        className="input dd-btn"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
      >
        <span>{sel?.label}</span>
        <ChevronDown size={16} className="dd-chev" />
      </button>
      {open && (
        <ul className="dd-list" role="listbox">
          {all.map((o, i) => (
            <li
              key={o.value || "any"}
              role="option"
              aria-selected={o.value === value}
              className={i === hi ? "hi" : ""}
              onMouseEnter={() => setHi(i)}
              onPointerDown={(e) => {
                e.preventDefault();
                pick(o);
              }}
            >
              <span>{o.label}</span>
              {o.value === value && <Check size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Select({ label, value, onChange, options, any = "Any" }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <Dropdown
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        any={any}
      />
    </div>
  );
}

export function PageHeader({ kicker, title }) {
  return (
    <header className="page-header">
      <p className="font-hand kicker">{kicker}</p>
      <h1 className="font-display">{title}</h1>
    </header>
  );
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open || !onClose) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="modal"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
          >
            <div className="modal-head">
              <h2 className="font-display">{title}</h2>
              {onClose && (
                <button
                  className="icon-btn"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const THEMES = [
  {
    id: "conservatory",
    name: "The Conservatory",
    desc: "Soft sage, warm ivory, muted olive and delicate botanical illustrations.",
    sw: ["#f3ecd9", "#8d9c7d", "#6e7448", "#1f3b2c"],
  },
  {
    id: "midnight",
    name: "The Midnight Garden",
    desc: "Deep forest green, moonlit silver, dusty lavender and mysterious glowing flora.",
    sw: ["#0f1a17", "#2b4a3c", "#c3ccd3", "#a99bd6"],
  },
  {
    id: "fieldnotes",
    name: "The Field Notes",
    desc: "Aged parchment, ink brown, faded moss, terracotta and scientific specimen labels.",
    sw: ["#e6d4ac", "#3b2a1a", "#7d8350", "#a5532f"],
  },
];
export function ThemePicker({ value, onPick }) {
  return (
    <div className="theme-grid">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className="theme-card"
          data-active={value === t.id}
          onClick={() => onPick(t.id)}
          aria-pressed={value === t.id}
        >
          <span className="tp" data-theme={t.id} aria-hidden="true">
            <span className="plate" data-tone="1"><BotanicalIllustration kind="flower" palette="lavender" seed={t.id + "a"} label="" /></span>
            <span className="plate" data-tone="2"><BotanicalIllustration kind="fern" palette="moss" seed={t.id + "b"} label="" /></span>
            <span className="plate" data-tone="3"><BotanicalIllustration kind="bell" palette="rose" seed={t.id + "c"} label="" /></span>
            <span className="plate" data-tone="4"><BotanicalIllustration kind="mushroom" palette="gold" seed={t.id + "d"} label="" /></span>
          </span>
          <strong className="font-display">{t.name}</strong>
          <small>{t.desc}</small>
        </button>
      ))}
    </div>
  );
}

export function Notes({ id }) {
  const { mark, setMark } = usePlants();
  const [text, setText] = useState("");
  const notes = mark(id).notes;
  const add = () => {
    if (!text.trim()) return;
    setMark(id, {
      notes: [
        ...notes,
        {
          id: Date.now(),
          text: text.trim(),
          at: new Date().toLocaleDateString(),
        },
      ],
    });
    setText("");
  };
  return (
    <div className="notes">
      <h3 className="font-head">Field observations</h3>
      {notes.length === 0 && (
        <p className="font-hand muted">No observations yet.</p>
      )}
      <ul>
        {notes.map((n) => (
          <li key={n.id} className="font-hand">
            <span>{n.text}</span>
            <small className="font-ui">{n.at}</small>
            <button
              className="icon-btn"
              aria-label="Delete note"
              onClick={() =>
                setMark(id, { notes: notes.filter((x) => x.id !== n.id) })
              }
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="note-add">
        <textarea
          className="input hand-input"
          rows={2}
          placeholder="Write an observation…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="New observation"
        />
        <button className="btn btn-ghost" onClick={add}>
          Add note
        </button>
      </div>
    </div>
  );
}

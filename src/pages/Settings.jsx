import { usePlants } from "../lib/store";
import { PageHeader, ThemePicker } from "../components/UI";
import { BackupControls } from "../components/Navigation";

const Section = ({ title, note, stacked, children }) => (
  <section
    className={`set-sec frame ${stacked ? "stacked" : ""}`}
    aria-labelledby={`s-${title}`}
  >
    <div className="set-head">
      <h2 className="font-head" id={`s-${title}`}>
        {title}
      </h2>
      {note && <p className="small">{note}</p>}
    </div>
    <div className="set-body">{children}</div>
  </section>
);

export default function Settings() {
  const { settings, updateSettings, dbError } = usePlants();
  return (
    <section className="page settings">
      <PageHeader kicker="Tune the herbarium" title="Settings" />
      <Section
        stacked
        title="Botanical world"
        note="Changes every colour, illustration, border and label at once."
      >
        <ThemePicker
          value={settings.theme || "conservatory"}
          onPick={(t) => updateSettings({ theme: t })}
        />
      </Section>
      <Section
        title="Backup"
        note="Export your collection or restore it from a file."
      >
        <BackupControls />
      </Section>
      <Section title="Storage" note="Where your herbarium lives.">
        <ul className="set-list">
          <li>
            Saved species, notes, favourites and settings are kept in this
            browser using IndexedDB. No account is needed.
          </li>
          <li>
            Clearing site data or switching devices removes them, so export a
            backup first.
          </li>
        </ul>
        {dbError && (
          <p className="error" role="alert">
            Storage problem: {dbError}
          </p>
        )}
      </Section>
      <Section title="Motion and cursor" note="Accessibility.">
        <ul className="set-list">
          <li>Animations follow your system&rsquo;s reduced-motion setting.</li>
          <li>
            The leaf cursor appears only with a mouse or trackpad, never on
            touch screens.
          </li>
        </ul>
      </Section>
      <Section title="About">
        <p className="small">
          Every species in this herbarium is fictional. Generated descriptions
          are imagination, not botanical fact.
        </p>
      </Section>
    </section>
  );
}

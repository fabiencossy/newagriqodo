import { useState } from 'react';
import { ViewSwitcher, VIEW_LABELS, type ViewKey } from './components/ViewSwitcher';

export default function App() {
  const [view, setView] = useState<ViewKey>('table');

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="m-0 text-2xl font-semibold text-(--color-text)">NewagriQodo — Sprint 0</h1>
        <p className="mt-1 text-sm text-(--color-muted)">
          Phase 1 scaffold OK. Premier composant : ViewSwitcher.
        </p>
      </header>

      <section className="rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <h2 className="mb-4 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          ViewSwitcher (auto)
        </h2>
        <ViewSwitcher views={['table', 'map', 'dashboard']} activeView={view} onChange={setView} />
        <p className="mt-4 text-sm text-(--color-muted)">
          Vue active : <strong className="text-(--color-text)">{VIEW_LABELS[view]}</strong>{' '}
          <code className="ml-2 rounded-(--radius-sm) bg-[#f1f1ee] px-1.5 py-0.5 font-mono text-xs">
            {view}
          </code>
        </p>
      </section>

      <section className="mt-6 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <h2 className="mb-4 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          Icon only (compact)
        </h2>
        <ViewSwitcher
          views={['table', 'map', 'dashboard', 'kanban', 'list', 'calendar']}
          activeView={view}
          onChange={setView}
          layout="segmented"
          display="icon-only"
        />
      </section>

      <section className="mt-6 rounded-(--radius) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-card)">
        <h2 className="mb-4 text-xs font-medium tracking-wider text-(--color-muted) uppercase">
          Dropdown (forcé)
        </h2>
        <ViewSwitcher
          views={['table', 'map', 'dashboard']}
          activeView={view}
          onChange={setView}
          layout="dropdown"
        />
      </section>
    </main>
  );
}

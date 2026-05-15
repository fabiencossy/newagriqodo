import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportButton } from './ExportButton';
import { generateCsv } from './generators';

const data = [
  { code: 'PF-001', name: 'Plat de la Cure', surface: 2.5, culture: 'Blé' },
  { code: 'PF-002', name: 'Champ du Haut', surface: 1.8, culture: 'Blé' },
];

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Nom' },
  { key: 'surface', label: 'Surface' },
  { key: 'culture', label: 'Culture' },
];

describe('ExportButton — bouton single format', () => {
  it('rend un bouton direct avec libellé du format', () => {
    render(
      <ExportButton data={data} columns={columns} filenameBase="parcelles" formats={['csv']} />,
    );
    expect(screen.getByRole('button', { name: /Télécharger CSV/i })).toBeInTheDocument();
    // Pas de menu en mode single
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('ExportButton — dropdown multi-format', () => {
  it('ouvre un menu avec les 3 formats', async () => {
    const user = userEvent.setup();
    render(
      <ExportButton
        data={data}
        columns={columns}
        filenameBase="parcelles"
        formats={['pdf', 'xlsx', 'csv']}
      />,
    );
    const trigger = screen.getByRole('button', { name: /Exporter/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /PDF/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Excel/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /CSV/ })).toBeInTheDocument();
  });
});

describe('ExportButton — disabled', () => {
  it('disabled si data vide', () => {
    render(<ExportButton data={[]} columns={columns} filenameBase="parcelles" formats={['csv']} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it("prop disabled bloque l'export", async () => {
    const user = userEvent.setup();
    const onExported = vi.fn();
    render(
      <ExportButton
        data={data}
        columns={columns}
        filenameBase="parcelles"
        formats={['csv']}
        onExported={onExported}
        disabled
      />,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onExported).not.toHaveBeenCalled();
  });
});

describe('ExportButton — onBeforeExport', () => {
  beforeEach(() => {
    // Stub createObjectURL pour jsdom + click sur <a> téléchargement
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('annule si onBeforeExport retourne false', async () => {
    const user = userEvent.setup();
    const onBeforeExport = vi.fn().mockReturnValue(false);
    const onExported = vi.fn();
    render(
      <ExportButton
        data={data}
        columns={columns}
        filenameBase="parcelles"
        formats={['csv']}
        onBeforeExport={onBeforeExport}
        onExported={onExported}
      />,
    );
    await user.click(screen.getByRole('button'));
    expect(onBeforeExport).toHaveBeenCalledExactlyOnceWith('csv');
    expect(onExported).not.toHaveBeenCalled();
  });

  it('exporte CSV et appelle onExported avec filename', async () => {
    const user = userEvent.setup();
    const onExported = vi.fn();
    render(
      <ExportButton
        data={data}
        columns={columns}
        filenameBase="parcelles"
        formats={['csv']}
        onExported={onExported}
      />,
    );
    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(onExported).toHaveBeenCalled();
    });
    const [format, filename] = onExported.mock.calls[0]!;
    expect(format).toBe('csv');
    expect(filename).toMatch(/^parcelles_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

describe('generateCsv', () => {
  it('produit un CSV avec séparateur ; par défaut', () => {
    const csv = generateCsv(data, columns);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Code;Nom;Surface;Culture');
    expect(lines[1]).toBe('PF-001;Plat de la Cure;2.5;Blé');
  });

  it('échappe les valeurs avec virgules / guillemets / sauts de ligne', () => {
    const tricky = [{ a: 'Une "valeur" complexe', b: 'avec; séparateur' }];
    const cols = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ];
    const csv = generateCsv(tricky, cols);
    expect(csv).toContain('"Une ""valeur"" complexe"');
    expect(csv).toContain('"avec; séparateur"');
  });
});

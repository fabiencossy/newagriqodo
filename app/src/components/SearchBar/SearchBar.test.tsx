import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';
import type { FieldDescriptor, SearchState } from './SearchBar.types';

const fields: FieldDescriptor[] = [
  { id: 'name', label: 'Nom', type: 'text' },
  { id: 'code', label: 'Code', type: 'text' },
  {
    id: 'culture',
    label: 'Culture',
    type: 'select',
    options: [
      { label: 'Blé', value: 'wheat' },
      { label: 'Maïs', value: 'corn' },
      { label: 'Colza', value: 'rapeseed' },
    ],
    groupable: true,
  },
  {
    id: 'status',
    label: 'Statut',
    type: 'select',
    options: [
      { label: 'Actif', value: 'active' },
      { label: 'Jachère', value: 'fallow' },
    ],
    groupable: true,
  },
];

const emptyState: SearchState = { facets: [], groupBy: [] };

describe('SearchBar — barre principale', () => {
  it('rend la barre avec rôle search', () => {
    render(<SearchBar fields={fields} value={emptyState} onChange={vi.fn()} />);
    expect(screen.getByRole('search', { name: 'Rechercher' })).toBeInTheDocument();
  });

  it("affiche le placeholder quand l'input est vide", () => {
    render(<SearchBar fields={fields} value={emptyState} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Rechercher…')).toBeInTheDocument();
  });

  it('rend une facet pour chaque filtre actif', () => {
    const state: SearchState = {
      facets: [{ id: 'f1', fieldId: 'culture', operator: 'in', values: ['wheat'] }],
      groupBy: [],
    };
    render(<SearchBar fields={fields} value={state} onChange={vi.fn()} />);
    expect(screen.getByText('Culture : wheat')).toBeInTheDocument();
    expect(screen.getByLabelText('Retirer Culture : wheat')).toBeInTheDocument();
  });

  it('retire une facet via son bouton ×', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const state: SearchState = {
      facets: [
        { id: 'f1', fieldId: 'culture', operator: 'in', values: ['wheat'] },
        { id: 'f2', fieldId: 'status', operator: 'in', values: ['active'] },
      ],
      groupBy: [],
    };
    render(<SearchBar fields={fields} value={state} onChange={onChange} />);
    await user.click(screen.getByLabelText('Retirer Culture : wheat'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      facets: [{ id: 'f2', fieldId: 'status', operator: 'in', values: ['active'] }],
      groupBy: [],
    });
  });
});

describe('SearchBar — suggestions', () => {
  it('ouvre la liste de suggestions à la saisie', async () => {
    const user = userEvent.setup();
    render(<SearchBar fields={fields} value={emptyState} onChange={vi.fn()} />);
    await user.click(screen.getByPlaceholderText('Rechercher…'));
    await user.type(screen.getByPlaceholderText('Rechercher…'), 'darv');
    const listbox = await screen.findByRole('listbox', { name: 'Suggestions' });
    expect(within(listbox).getByRole('option', { name: /Nom :/i })).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: /Code :/i })).toBeInTheDocument();
  });

  it('crée une facet en cliquant une suggestion', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar fields={fields} value={emptyState} onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('Rechercher…'), 'darval');
    const listbox = await screen.findByRole('listbox', { name: 'Suggestions' });
    await user.click(within(listbox).getByRole('option', { name: /Nom :/i }));
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall.facets).toHaveLength(1);
    expect(lastCall.facets[0]).toMatchObject({
      fieldId: 'name',
      operator: 'contains',
      values: ['darval'],
    });
  });
});

describe('SearchBar — dropdown filtres', () => {
  it('ouvre le dropdown via le chevron', async () => {
    const user = userEvent.setup();
    render(<SearchBar fields={fields} value={emptyState} onChange={vi.fn()} />);
    const chevron = screen.getByRole('button', { name: 'Ouvrir filtres et favoris' });
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
    await user.click(chevron);
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('toggle une option de filtre crée une facet', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar fields={fields} value={emptyState} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Ouvrir filtres et favoris' }));

    // Récupérer la colonne "Filtres" via son header
    const filtersHeader = screen.getByText('Filtres');
    const filtersColumn = filtersHeader.closest('div')!;

    // Ouvrir le sous-menu Culture
    await user.click(within(filtersColumn).getByRole('menuitem', { name: /Culture/i }));

    // Cliquer "Blé"
    await user.click(within(filtersColumn).getByRole('button', { name: /Blé/i }));

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall.facets).toHaveLength(1);
    expect(lastCall.facets[0]).toMatchObject({
      fieldId: 'culture',
      operator: 'in',
      values: ['wheat'],
    });
  });

  it('toggle un champ groupable crée un groupBy', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar fields={fields} value={emptyState} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Ouvrir filtres et favoris' }));

    const groupHeader = screen.getByText('Regrouper');
    const groupColumn = groupHeader.closest('div')!;
    await user.click(within(groupColumn).getByRole('menuitem', { name: /Culture/i }));

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall.groupBy).toEqual([{ fieldId: 'culture' }]);
  });
});

describe('SearchBar — clavier', () => {
  it('Backspace sur input vide retire la dernière facet', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const state: SearchState = {
      facets: [
        { id: 'f1', fieldId: 'culture', operator: 'in', values: ['wheat'] },
        { id: 'f2', fieldId: 'status', operator: 'in', values: ['active'] },
      ],
      groupBy: [],
    };
    render(<SearchBar fields={fields} value={state} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Affiner…');
    await user.click(input);
    await user.keyboard('{Backspace}');
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall.facets).toHaveLength(1);
    expect(lastCall.facets[0]?.id).toBe('f1');
  });
});
